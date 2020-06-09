const notesService = {
  getAllNotes(knex) {
    return knex.select("*").from("noteful_notes");
  },

  insertnote(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into("noteful_notes")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex.from("noteful_notes").select("*").where("id", id).first();
  },

  deletenote(knex, id) {
    return knex("noteful_notes").where({ id }).delete();
  },
};

module.exports = notesService;
