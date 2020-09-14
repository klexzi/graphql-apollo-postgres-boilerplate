export default {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          username: 'johnny',
          email: 'johnny@mail.com',
          password:
            '$2a$10$6GbrsfXL29N7F5bPUizHdO6x7.hUYEJ3Y1lAJXkk/XSFkFx/tL5SW',
          role: 'ADMIN',
          hasPassword: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'janet',
          email: 'janet@mail.com',
          password:
            '$2a$10$.1S64Rs.n7r98hzePxtMlO7tqup34imqVWetu8nl1CmgKWhBorSlC',
          hasPassword: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        validate: true,
        individualHooks: true,
      },
    );
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
