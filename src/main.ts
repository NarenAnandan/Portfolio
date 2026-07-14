import { renderContent } from './content/render';
import { resume } from './content/resume';
import './styles/main.css';

const content = document.getElementById('content') as HTMLElement;
renderContent(content, resume);
