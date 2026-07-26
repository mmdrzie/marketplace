/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // Rule 1: Domain entities must NOT import infrastructure
    {
      name: 'domain-not-import-infrastructure',
      comment: 'Domain layer must not depend on infrastructure',
      severity: 'error',
      from: { path: '^src/domain/entities/' },
      to: { path: '^src/domain/infrastructure/' },
    },
    // Rule 2: Domain entities must NOT import application
    {
      name: 'domain-not-import-application',
      severity: 'error',
      from: { path: '^src/domain/entities/' },
      to: { path: '^src/domain/application/' },
    },
    // Rule 3: Domain entities must NOT import presentation
    {
      name: 'domain-not-import-presentation',
      severity: 'error',
      from: { path: '^src/domain/entities/' },
      to: { path: '^src/domain/presentation/' },
    },
    // Rule 4: Application must NOT import presentation
    {
      name: 'application-not-import-presentation',
      severity: 'error',
      from: { path: '^src/domain/application/' },
      to: { path: '^src/domain/presentation/' },
    },
    // Rule 5: Presentation must NOT import infrastructure directly
    {
      name: 'presentation-not-import-infrastructure',
      severity: 'error',
      from: { path: '^src/domain/presentation/' },
      to: { path: '^src/domain/infrastructure/' },
    },
    // Rule 6: Projection must NOT import write model entities
    {
      name: 'projection-not-import-domain-entities',
      severity: 'error',
      from: { path: '^src/domain/projection/' },
      to: { path: '^src/domain/entities/' },
    },
    // Rule 7: Routes must NOT import repositories directly
    // (legacy routes violate this; migrating to controllers)
    {
      name: 'routes-not-import-repositories',
      severity: 'warn',
      from: { path: '^src/routes/' },
      to: { path: '^src/repositories/' },
    },
    // Rule 8: config must be a leaf module
    {
      name: 'config-not-import-domain',
      severity: 'error',
      from: { path: '^src/config/' },
      to: { path: '^src/domain/' },
    },
    // Rule 9: No circular dependencies
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies cause maintainability issues',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    includeOnly: '^src',
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node'],
    },
  },
};
