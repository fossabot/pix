module.exports = function organizationsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildOrganization({
    id: 2,
    type: 'SUP',
    name: 'Tyrion SUP',
    code: 'SUPTY'
  });
  databaseBuilder.factory.buildOrganization({
    id: 3,
    type: 'SCO',
    name: 'SCOw',
    code: 'SCO12'
  });
};
