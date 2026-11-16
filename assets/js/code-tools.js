// Adds "copy" and "download" buttons to the top-right corner of code blocks.
// Plain JS, no dependencies. Without JavaScript the blocks simply have no buttons.
(function () {
  'use strict';

  var ICONS = {
    copy:
      '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3v5.5A1.5 1.5 0 0 0 3.5 10H4"/></svg>',
    download:
      '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11"/></svg>',
    check:
      '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 8.5 6.5 12 13 4.5"/></svg>'
  };

  var EXT = {
    bash: 'sh', sh: 'sh', shell: 'sh', zsh: 'sh', python: 'py', py: 'py',
    javascript: 'js', js: 'js', json: 'json', yaml: 'yml', yml: 'yml',
    html: 'html', css: 'css', c: 'c', cpp: 'cpp', ruby: 'rb', java: 'java',
    go: 'go', rust: 'rs', php: 'php', sql: 'sql', xml: 'xml', ini: 'ini',
    pgp: 'asc', asc: 'asc'
  };

  function codeText(pre) {
    var code = pre.querySelector('code') || pre;
    return code.textContent.replace(/\n+$/, '') + '\n';
  }

  function fileName(box, pre) {
    // Optional per-block name: {: data-filename="x.asc"} after a fenced block.
    var named = pre.dataset.filename || box.dataset.filename;
    if (named) return named;
    var code = pre.querySelector('code');
    var m = /language-([\w+-]+)/.exec(box.className + ' ' + (code ? code.className : ''));
    return 'code.' + ((m && EXT[m[1]]) || 'txt');
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts (e.g. http://0.0.0.0 in local dev).
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function download(name, text) {
    var url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function button(kind, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'code-tool';
    b.title = label;
    b.setAttribute('aria-label', label);
    b.innerHTML = ICONS[kind];
    return b;
  }

  function flash(btn, kind, label) {
    btn.innerHTML = ICONS.check;
    btn.classList.add('is-done');
    btn.title = label;
    btn.setAttribute('aria-label', label);
    setTimeout(function () {
      btn.innerHTML = ICONS[kind];
      btn.classList.remove('is-done');
    }, 1500);
  }

  // If the first line of the block is "@filename: name.ext", use it as the
  // download name, show it as a label and remove the line from the content.
  function takeFilename(pre) {
    var code = pre.querySelector('code') || pre;
    var m = /^@filename:[ \t]*(\S+)[ \t]*(?:\n|$)/.exec(code.textContent);
    if (!m) return null;

    var toRemove = m[0].length;
    var walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (var i = 0; i < nodes.length && toRemove > 0; i++) {
      var n = nodes[i];
      var cut = Math.min(n.nodeValue.length, toRemove);
      n.nodeValue = n.nodeValue.slice(cut);
      toRemove -= cut;
      if (!n.nodeValue && n.parentNode !== code) n.parentNode.removeChild(n);
    }
    return m[1];
  }

  function enhance(pre) {
    var box = pre.closest('div.highlighter-rouge, .code-block');
    if (!box) {
      box = document.createElement('div');
      box.className = 'code-block';
      pre.parentNode.insertBefore(box, pre);
      box.appendChild(pre);
    }
    if (box.querySelector('.code-toolbar')) return;

    var name = takeFilename(pre);
    if (name) {
      pre.dataset.filename = name;
      var label = document.createElement('span');
      label.className = 'code-filename';
      label.textContent = name;
      box.appendChild(label);
      box.classList.add('has-filename');
    }

    var bar = document.createElement('div');
    bar.className = 'code-toolbar';

    var dl = button('download', 'Download');
    dl.addEventListener('click', function () {
      download(fileName(box, pre), codeText(pre));
      flash(dl, 'download', 'Downloaded');
    });

    var cp = button('copy', 'Copy to clipboard');
    cp.addEventListener('click', function () {
      copyText(codeText(pre)).then(
        function () { flash(cp, 'copy', 'Copied'); },
        function () { cp.title = 'Copy failed'; }
      );
    });

    bar.appendChild(dl);
    bar.appendChild(cp);
    box.appendChild(bar);
  }

  function init() {
    var blocks = document.querySelectorAll('.post-content pre');
    for (var i = 0; i < blocks.length; i++) enhance(blocks[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
