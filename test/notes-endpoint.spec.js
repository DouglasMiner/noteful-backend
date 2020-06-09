const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makenotesArray } = require("./notes-fixtures");
const { makeFoldersArray } = require("./folders-fixtures");

describe.only("notes Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  // before("clean the table", () =>
  //   db.raw("TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE")
  // );
  afterEach("cleanup", () =>
    db.raw("TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE")
  );

  describe("GET /notes", () => {
    const testNotes = makenotesArray();
    const testFolders = makeFoldersArray();
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/notes").expect(200, []);
      });
    });

    context("Given there are notes in the database", () => {
      beforeEach("insert notes", () => {
        return db
          .into("noteful_folders")
          .insert(testFolders)
          .then(() => {
            return db.into("noteful_notes").insert(testNotes);
          });
      });
      it("respond with 200 and all of the notes", () => {
        return supertest(app).get("/notes").expect(200, testNotes);
      });
    });
  });

  describe("GET /notes/:note_id", () => {
    context("Given no notes", () => {
      it("respond with 404", () => {
        const noteId = 12345;
        return supertest(app)
          .get(`/notes/${noteId}`)
          .expect(404, { error: { message: "note doesn't exist" } });
      });
    });
    context("Given there are notes in the database", () => {
      const testnotes = makenotesArray();
      const testFolders = makeFoldersArray();
      beforeEach("insert notes", () => {
        return db.into("noteful_folders").insert(testFolders).then(() => {
          return db.into("noteful_notes").insert(testnotes);
        })
      });

      it("responds with 200 and the specified note", () => {
        const noteId = 3;
        const expectednote = testnotes[noteId - 1];
        return supertest(app)
          .get(`/notes/${noteId}`)
          .expect(200, expectednote);
      });
    });
  });

  describe("POST /notes", () => {
    it("creates an article, responding with 201 and the new article", () => {
      const newnote = {
        name: "test new note",
        folder_id: 1
      };
      return supertest(app)
        .post("/notes")
        .send(newnote)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(newnote.name);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/notes/${res.body.id}`);
        })
        .then((res) => {
          supertest(app).get(`/notes/${res.body.id}`).expect(res.body);
        });
    });
  });

  describe("DELETE /notes/:note_id", () => {
    context(`Given no articles`, () => {
      it("responds with 404", () => {
        const noteId = 12345;
        return supertest(app)
          .delete(`/notes/${noteId}`)
          .expect(404, { error: { message: `note does not exist` } });
      });
    });

    context("Given there are notes in database", () => {
      const testnotes = makenotesArray();
      beforeEach("insert notes", () => {
        return db
          .into("noteful_folders")
          .insert(testFolders)
          .then(() => {
            return db.into("noteful_notes").insert(testNotes);
          });
      });
      it("responds with 204 and removes the note", () => {
        const removeId = 3;
        const expectednotes = testnotes.filter((note) => note.id !== removeId);
        return supertest(app)
          .delete(`/notes/${removeId}`)
          .expect(204)
          .then((res) => supertest(app).get(`/notes`).expect(expectednotes));
      });
    });
  });
});
