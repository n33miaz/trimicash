const fs = require('fs');
const path = require('path');

const components = [
  'button', 'icon-button', 'card', 'input', 'money-input', 
  'select', 'date-input', 'modal', 'table', 'badge', 
  'empty-state', 'loading-state', 'error-state', 'page-header', 'stat-card'
];

const basePath = path.join(__dirname, 'src', 'app', 'shared', 'components');

components.forEach(name => {
  const dir = path.join(basePath, name);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const className = name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Component';
  const fileName = `${name}.component.ts`;
  
  const content = `import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tc-${name}',
  standalone: true,
  imports: [],
  template: \`<p>${name} works!</p>\`,
  styles: [\`:host { display: block; }\`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ${className} {
}
`;

  const filePath = path.join(dir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created ${filePath}`);
  }
});
