function makenotesArray() {
  return [
    {
      id: 1,
      name: "first",
      modified: new Date().toISOString(),
      folder_id: 5,
      content: 'lorem asdjhfiaushdf'
    },
    {
      id: 2,
      name: "second",
      modified: new Date().toISOString(),
      folder_id: 4,
      content: "some content"
    },
    {
      id: 3,
      name: "third",
      modified: new Date().toISOString(),
      folder_id: 3,
      content: "more content"
    },
    {
      id: 4,
      name: "fourth",
      modified: new Date().toISOString(),
      folder_id: 2,
      content: "even more content"
    },
    {
      id: 5,
      name: "fifth",
      modified: new Date().toISOString(),
      folder_id: 1,
      content: "last content"
    },
  ];
}

module.exports = { makenotesArray };
