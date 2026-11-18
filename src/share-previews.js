/* Preview the exact files a member selected before anything is uploaded. */
(() => {
  function attach(formId, fieldName, kind, label) {
    const form = document.getElementById(formId);
    const input = form?.elements[fieldName];
    if (!input) return;
    const holder = document.createElement('div');
    holder.className = 'share-file-preview';
    holder.hidden = true;
    input.closest('label').after(holder);
    let objectUrl = '';
    const clear = () => {
      holder.querySelector('audio')?.pause();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = '';
      holder.replaceChildren();
      holder.hidden = true;
    };
    const show = () => {
      clear();
      const file = input.files?.[0];
      if (!file) return;
      holder.hidden = false;
      const heading = document.createElement('strong');
      heading.textContent = label;
      const detail = document.createElement('small');
      detail.textContent = file.name + ' · ' + (file.size / 1048576).toFixed(1) + ' MB';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + file.name);
      remove.addEventListener('click', () => { input.value = ''; clear(); });
      const head = document.createElement('div');
      head.className = 'share-file-preview-head';
      head.append(heading, detail, remove);
      holder.append(head);
      const supported = kind === 'audio'
        ? ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/wav', 'audio/webm'].includes(file.type) && file.size <= 8 * 1048576
        : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) && file.size <= (file.type === 'image/gif' ? 1048576 : 15 * 1048576);
      if (!supported) {
        const warning = document.createElement('p');
        warning.className = 'share-file-preview-error';
        warning.setAttribute('role', 'alert');
        warning.textContent = kind === 'audio' ? 'Use MP3, M4A, OGG, WAV or WebM under 8 MB.' : 'Use JPG, PNG or WebP under 15 MB, or GIF under 1 MB.';
        holder.append(warning);
        return;
      }
      objectUrl = URL.createObjectURL(file);
      if (kind === 'audio') {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.preload = 'metadata';
        audio.src = objectUrl;
        audio.setAttribute('aria-label', 'Preview selected audio');
        holder.append(audio);
      } else {
        const image = document.createElement('img');
        image.src = objectUrl;
        image.alt = 'Preview of ' + file.name;
        holder.append(image);
        if (fieldName === 'cover') {
          const note = document.createElement('p');
          note.textContent = 'This photo will replace the suggested catalog cover.';
          holder.append(note);
        }
      }
    };
    input.addEventListener('change', show);
    form.addEventListener('reset', clear);
    form.closest('dialog')?.addEventListener('close', clear);
  }
  document.addEventListener('DOMContentLoaded', () => {
    attach('upload-form', 'cover', 'image', 'Your cover');
    attach('upload-form', 'file', 'audio', 'Your audio');
    attach('generic-post-form', 'image', 'image', 'Your photo');
  });
})();
