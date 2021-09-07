module.exports = {
  dataSource: 'prs',
  prefix: '',
  onlyMilestones: false,
  tags: 'all',
  ignoreTagsWith: ['alpha', 'beta'],
  groupBy: false,
  changelogFilename: 'CHANGELOG.md',
  generate: 'true',
  override: 'true',
  template: {
    commit: ({message, url, author, name}) =>
      `- [${message}](${url}) - ${author ? `@${author}` : name}`,
    issue: '- {{labels}} {{name}} [{{text}}]({{url}})',
    Xlabel: '[**{{label}}**]',
    label: '',
    XnoLabel: 'closed',
    group: '\n#### {{heading}}\n',
    changelogTitle: '# Changelog\n\n',
    release: function (placeholders, body) {
      var dateParts = placeholders.date.split('/');
      var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
      return `## ${placeholders.release} (${date.toLocaleString('en', {
        dateStyle: 'short',
      })})\n${placeholders.body}`;
    },
    releaseSeparator: '\n---\n\n',
  },
};
