const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeFoldersArray } = require("./folders-fixtures");

describe("Folders Endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());
  before("clean the table", () =>
    db.raw("TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE")
  );
  afterEach("cleanup", () =>
    db.raw("TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE")
  );

  describe("GET /folders", () => {
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/folders").expect(200, []);
      });
    });

    context("Given there are folders in the database", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("noteful_folders").insert(testFolders);
      });
      it("respond with 200 and all of the folders", () => {
        return supertest(app).get("/folders").expect(200, testFolders);
      });
    });
  });

  describe("GET /folders/:folder_id", () => {
    context("Given no folders", () => {
      it("respond with 404", () => {
        const folderId = 12345;
        return supertest(app)
          .get(`/folders/${folderId}`)
          .expect(404, { error: { message: "Folder doesn't exist" } });
      });
    });
    context("Given there are folders in the database", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("noteful_folders").insert(testFolders);
      });

      it("responds with 200 and the specified folder", () => {
        const folderId = 3;
        const expectedFolder = testFolders[folderId - 1];
        return supertest(app)
          .get(`/folders/${folderId}`)
          .expect(200, expectedFolder);
      });
    });
  });

  describe("POST /folders", () => {
    it("creates an article, responding with 201 and the new article", () => {
      const newFolder = {
        name: "test new folder",
      };
      return supertest(app)
        .post("/folders")
        .send(newFolder)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(newFolder.name);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/folders/${res.body.id}`);
        })
        .then((res) => {
          supertest(app).get(`/folders/${res.body.id}`).expect(res.body);
        });
    });
  });

  describe("DELETE /folders/:folder_id", () => {
    context(`Given no articles`, () => {
      it("responds with 404", () => {
        const folderId = 12345;
        return supertest(app)
          .delete(`/folders/${folderId}`)
          .expect(404, { error: { message: `folder does not exist` } });
      });
    });

    context("Given there are folders in database", () => {
      const testFolders = makeFoldersArray();
      beforeEach("insert articles", () => {
        return db.into("noteful_folders").insert(testFolders);
      });
      it("responds with 204 and removes the folder", () => {
        const removeId = 3;
        const expectedFolders = testFolders.filter(
          (folder) => folder.id !== removeId
        );
        return supertest(app)
          .delete(`/folders/${removeId}`)
          .expect(204)
          .then((res) =>
            supertest(app).get(`/folders`).expect(expectedFolders)
          );
      });
    });
  });
});
