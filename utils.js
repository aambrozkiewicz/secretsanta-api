function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

exports.generateSecretSantas = (people) => {
  shuffleArray(people);
  const peopleOffset = [
    people[people.length - 1],
    ...people.slice(0, people.length - 1),
  ];

  return people.map((p, i) => [p, peopleOffset[i]]);
};

exports.randomHash = () => {
  return (Math.random() + 1).toString(36).substring(2);
};
