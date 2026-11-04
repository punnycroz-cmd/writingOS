// developing/working/src/runtime/diff-visualizer.ts
// Writing OS — Tracked Changes Visual Diff Generator
// Styling:
// - Removed text: Red with reduced opacity (no strikethrough), cleanly legible.
// - Added text: Vibrant green with subtle background highlight.

export interface DiffSegment {
  type: 'UNCHANGED' | 'REMOVED' | 'ADDED';
  text: string;
}

export class DiffVisualizer {
  /**
   * Generates a word/token-level diff between original and polished text.
   */
  public static computeDiff(original: string, updated: string): DiffSegment[] {
    const origTokens = this.tokenize(original);
    const updTokens = this.tokenize(updated);

    const lcsMatrix = this.buildLcsMatrix(origTokens, updTokens);
    const segments: DiffSegment[] = [];

    let i = origTokens.length;
    let j = updTokens.length;

    const rawDiff: DiffSegment[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origTokens[i - 1] === updTokens[j - 1]) {
        rawDiff.unshift({ type: 'UNCHANGED', text: origTokens[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || lcsMatrix[i][j - 1] >= lcsMatrix[i - 1][j])) {
        rawDiff.unshift({ type: 'ADDED', text: updTokens[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || lcsMatrix[i][j - 1] < lcsMatrix[i - 1][j])) {
        rawDiff.unshift({ type: 'REMOVED', text: origTokens[i - 1] });
        i--;
      }
    }

    // Merge consecutive segments of the same type for cleaner markup
    for (const token of rawDiff) {
      const last = segments[segments.length - 1];
      if (last && last.type === token.type) {
        last.text += token.text;
      } else {
        segments.push({ type: token.type, text: token.text });
      }
    }

    return segments;
  }

  /**
   * Renders HTML Tracked Changes with embedded instant Select-to-Translate tooltip.
   * - Removed text is RED with LOW OPACITY (soft red color, opacity ~0.55, no strikethrough).
   * - Added text is GREEN (vibrant green, subtle background glow).
   * - Selecting any word/sentence pops up an instant Vietnamese translation.
   */
  public static renderTrackedChangesHtml(original: string, updated: string, title: string = 'Writing OS — Tracked Changes View'): string {
    const segments = this.computeDiff(original, updated);

    const bodyHtml = segments.map(seg => {
      if (seg.type === 'UNCHANGED') {
        return this.escapeHtml(seg.text);
      } else if (seg.type === 'REMOVED') {
        // Red, reduced opacity, NO strikethrough for pleasant reading
        return `<span class="diff-removed" style="color: #cf222e; opacity: 0.55; background-color: rgba(207, 34, 46, 0.08); padding: 0 2px; border-radius: 2px;">${this.escapeHtml(seg.text)}</span>`;
      } else if (seg.type === 'ADDED') {
        // Vibrant green, subtle highlight
        return `<span class="diff-added" style="color: #1a7f37; font-weight: 500; background-color: rgba(26, 127, 55, 0.12); padding: 0 2px; border-radius: 2px;">${this.escapeHtml(seg.text)}</span>`;
      }
      return '';
    }).join('');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.8;
      color: #1f2328;
      background-color: #f6f8fa;
      margin: 0;
      padding: 40px 20px;
    }
    .manuscript-container {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px 56px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(149, 157, 165, 0.12);
      border: 1px solid #d0d7de;
      font-size: 17px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .legend {
      max-width: 840px;
      margin: 0 auto 20px auto;
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #656d76;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-box {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }
    /* Floating Translation Tooltip */
    #translation-tooltip {
      position: absolute;
      display: none;
      background: #24292f;
      color: #ffffff;
      padding: 10px 14px;
      border-radius: 8px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      font-size: 14px;
      line-height: 1.4;
      max-width: 320px;
      z-index: 10000;
      pointer-events: auto;
      transition: opacity 0.15s ease-in-out;
    }
    #translation-tooltip::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -6px;
      border-width: 6px;
      border-style: solid;
      border-color: #24292f transparent transparent transparent;
    }
    .trans-header {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #8c959f;
      margin-bottom: 4px;
    }
    .trans-body {
      font-weight: 500;
      color: #54aeff;
    }
  </style>
</head>
<body>

  <div class="legend">
    <div class="legend-item">
      <div class="legend-box" style="background-color: rgba(207, 34, 46, 0.25); border: 1px solid #cf222e;"></div>
      <span>Đoạn đã xóa (Màu đỏ mờ, không gạch ngang)</span>
    </div>
    <div class="legend-item">
      <div class="legend-box" style="background-color: rgba(26, 127, 55, 0.25); border: 1px solid #1a7f37;"></div>
      <span>Đoạn thêm mới (Màu xanh lá)</span>
    </div>
    <div class="legend-item" style="margin-left: auto;">
      <span>💡 <i>Bôi đen từ hoặc câu bất kỳ để xem bản dịch tiếng Việt tức thì</i></span>
    </div>
  </div>

  <div class="manuscript-container" id="manuscript">${bodyHtml}</div>

  <!-- Floating Translation Tooltip -->
  <div id="translation-tooltip">
    <div class="trans-header">Bản dịch tiếng Việt</div>
    <div class="trans-body" id="trans-content">Đang dịch...</div>
  </div>

  <script>
    const tooltip = document.getElementById('translation-tooltip');
    const transContent = document.getElementById('trans-content');
    let lastQuery = '';

    window.handleTranslationResponse = function(data) {
      if (data && data[0]) {
        const translatedText = data[0].map(item => item[0]).join('');
        transContent.innerText = translatedText;
      } else {
        transContent.innerText = 'Không tìm thấy bản dịch.';
      }
    };

    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (!text || text.length === 0) {
        tooltip.style.display = 'none';
        return;
      }

      if (text.length > 500) {
        return;
      }

      lastQuery = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
      transContent.innerText = 'Đang dịch...';

      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      const tooltipX = rect.left + scrollX + (rect.width / 2) - 80;
      const tooltipY = rect.top + scrollY - 55;

      tooltip.style.left = Math.max(10, tooltipX) + 'px';
      tooltip.style.top = Math.max(10, tooltipY) + 'px';

      // Bypass local file:/// CORS restrictions using JSONP
      const oldScript = document.getElementById('google-trans-script');
      if (oldScript) oldScript.remove();

      const script = document.createElement('script');
      script.id = 'google-trans-script';
      script.src = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=' + encodeURIComponent(text) + '&callback=handleTranslationResponse';
      
      script.onerror = () => {
        fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|vi')
          .then(res => res.json())
          .then(resData => {
            if (resData && resData.responseData && resData.responseData.translatedText) {
              transContent.innerText = resData.responseData.translatedText;
            } else {
              transContent.innerText = 'Không thể dịch đoạn này.';
            }
          })
          .catch(() => {
            transContent.innerText = 'Lỗi kết nối mạng.';
          });
      };

      document.body.appendChild(script);
    });

    document.addEventListener('mousedown', (e) => {
      if (!tooltip.contains(e.target)) {
        tooltip.style.display = 'none';
      }
    });
  </script>
</body>
</html>`;
  }

  /**
   * Renders a Markdown-friendly tracked changes block.
   */
  public static renderTrackedChangesMarkdown(original: string, updated: string): string {
    const segments = this.computeDiff(original, updated);
    return segments.map(seg => {
      if (seg.type === 'UNCHANGED') {
        return this.escapeHtml(seg.text);
      } else if (seg.type === 'REMOVED') {
        return `<span style="color: #cf222e; opacity: 0.55; background-color: rgba(207, 34, 46, 0.08); padding: 0 2px;">${this.escapeHtml(seg.text)}</span>`;
      } else if (seg.type === 'ADDED') {
        return `<span style="color: #1a7f37; font-weight: 500; background-color: rgba(26, 127, 55, 0.12); padding: 0 2px;">${this.escapeHtml(seg.text)}</span>`;
      }
      return '';
    }).join('');
  }

  private static tokenize(text: string): string[] {
    // Tokenize by words and whitespace/punctuation tokens
    return text.match(/(\s+|[^\s\w]+|\w+)/g) || [text];
  }

  private static buildLcsMatrix(a: string[], b: string[]): number[][] {
    const matrix: number[][] = Array(a.length + 1).fill(0).map(() => Array(b.length + 1).fill(0));

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }

    return matrix;
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
