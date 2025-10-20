import './HtmlErrorOverlay.css';
import { useRecoilState } from 'recoil';
import { htmlErrorState } from '../store/errorState';

function HtmlErrorOverlay() {
  const [htmlContent, setHtmlContent] = useRecoilState(htmlErrorState);

  if (!htmlContent) {
    return null;
  }

  return (
    <div className="html-error-overlay">
      <div className="html-error-header">
        <span>Erreur renvoyée par le backend</span>
        <button type="button" onClick={() => setHtmlContent(null)}>
          Fermer
        </button>
      </div>

      <iframe
        title="Backend error"
        srcDoc={htmlContent}
        className="html-error-frame"
      />
    </div>
  );
}

export default HtmlErrorOverlay;
