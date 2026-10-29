/* Member-created public music charts. The server enforces ownership and limits. */
(() => {
  const dialog = el('dialog', 'category-create-dialog');
  dialog.id = 'category-create-dialog';
  dialog.innerHTML = `<form id="category-create-form"><div class="dialog-head"><div><p class="kicker">A NEW LISTENING ROOM</p><h2>Create a category</h2></div><button type="button" data-close aria-label="Close">×</button></div><p class="dialog-intro">Your category appears publicly for everyone. Each member can create up to three; choose a clear, distinct name.</p><label>Category name<input name="name" required minlength="2" maxlength="30" placeholder="For example, City Pop"></label><p class="form-error" role="alert"></p><div class="form-actions"><button type="submit" class="primary-button">Create category ↗</button></div></form>`;
  document.body.append(dialog);
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  document.getElementById('hub-create-category').addEventListener('click', () => {
    if (!requireAccount()) return;
    dialog.querySelector('.form-error').textContent = '';
    dialog.showModal();
  });
  dialog.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!requireAccount()) return;
    const form = event.currentTarget, name = form.elements.name.value.trim(), button = form.querySelector('[type="submit"]'), error = form.querySelector('.form-error');
    if (name.length < 2) { error.textContent = 'Use at least two characters.'; return; }
    button.disabled = true; error.textContent = '';
    try {
      const result = await client.from('music_categories').insert({ name, owner_id: user.id }).select('id').single();
      if (result.error) throw result.error;
      await loadMusicCategories();
      form.reset(); dialog.close();
      document.getElementById('music-hub-categories').open = true;
      toast('Category created. Everyone can now share songs here.');
    } catch (failed) { error.textContent = failed.code === '23505' ? 'This category name is already in use.' : failed.message || 'Could not create the category.'; }
    finally { button.disabled = false; }
  });
})();
