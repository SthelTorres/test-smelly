const { UserService } = require('../src/userService');

const DADOS_USUARIO_PADRAO = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

const CABECALHO_RELATORIO = '--- Relatório de Usuários ---';

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve retornar um usuário com id definido ao criar um usuário válido', () => {
      // Arrange
      const { nome, email, idade } = DADOS_USUARIO_PADRAO;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado.id).toBeDefined();
    });

    test('deve criar o usuário com o nome informado', () => {
      // Arrange
      const { nome, email, idade } = DADOS_USUARIO_PADRAO;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado.nome).toBe(nome);
    });

    test('deve criar o usuário com o status "ativo" por padrão', () => {
      // Arrange
      const { nome, email, idade } = DADOS_USUARIO_PADRAO;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado.status).toBe('ativo');
    });

    test('deve lançar erro ao tentar criar usuário menor de idade', () => {
      // Arrange
      const criarUsuarioMenorDeIdade = () =>
        userService.createUser('Menor', 'menor@email.com', 17);

      // Act & Assert
      expect(criarUsuarioMenorDeIdade).toThrow(
        'O usuário deve ser maior de idade.'
      );
    });

    test('deve lançar erro quando o nome não for informado', () => {
      // Arrange
      const criarSemNome = () =>
        userService.createUser('', 'sem-nome@email.com', 25);

      // Act & Assert
      expect(criarSemNome).toThrow('Nome, email e idade são obrigatórios.');
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário previamente criado quando buscado pelo id', () => {
      // Arrange
      const { nome, email, idade } = DADOS_USUARIO_PADRAO;
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).not.toBeNull();
      expect(usuarioBuscado.id).toBe(usuarioCriado.id);
    });

    test('deve retornar null quando o id buscado não existir', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve retornar true ao desativar um usuário comum', () => {
      // Arrange
      const usuarioComum = userService.createUser(
        'Comum',
        'comum@teste.com',
        30
      );

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
    });

    test('deve alterar o status do usuário comum para "inativo" após desativação', () => {
      // Arrange
      const usuarioComum = userService.createUser(
        'Comum',
        'comum@teste.com',
        30
      );

      // Act
      userService.deactivateUser(usuarioComum.id);
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);

      // Assert
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('deve retornar false ao tentar desativar um usuário administrador', () => {
      // Arrange
      const usuarioAdmin = userService.createUser(
        'Admin',
        'admin@teste.com',
        40,
        true
      );

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
    });

    test('deve manter o status "ativo" do usuário administrador após tentativa de desativação', () => {
      // Arrange
      const usuarioAdmin = userService.createUser(
        'Admin',
        'admin@teste.com',
        40,
        true
      );

      // Act
      userService.deactivateUser(usuarioAdmin.id);
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);

      // Assert
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('deve retornar false ao tentar desativar um usuário inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve iniciar o relatório com o cabeçalho padrão', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(CABECALHO_RELATORIO);
    });

    test('deve incluir o nome de cada usuário cadastrado no relatório', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('Bob');
    });

    test('deve incluir o id do usuário no relatório', () => {
      // Arrange
      const usuario = userService.createUser('Alice', 'alice@email.com', 28);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(usuario.id);
    });

    test('deve indicar que não há usuários cadastrados quando o banco estiver vazio', () => {
      // Arrange (banco já limpo pelo beforeEach)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado.');
    });
  });
});
