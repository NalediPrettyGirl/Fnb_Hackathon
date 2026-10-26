import { initShell } from '../components/shell.js';
import { profileService } from '../services/profile.js';
import { notify } from '../core/toast.js';
import { setBusy, initials, $ } from '../core/dom.js';

const user = initShell({ active: 'profile' });

const parseSkills = text => [...new Set(text.split(',').map(skill => skill.trim()).filter(Boolean))];
const showError = message => { const box = $('#profileError'); box.textContent = message || ''; box.hidden = !message; };

function fill(profile) {
  $('#profileName').value = profile.name || '';
  $('#profileEmail').value = profile.email || '';
  $('#profileHeadline').value = profile.headline || '';
  $('#profileBio').value = profile.bio || '';
  $('#profileLocation').value = profile.location || '';
  $('#profileWebsite').value = profile.website || '';
  $('#profileSkills').value = (profile.skills || []).join(', ');
  const career = profile.headline || (typeof localStorage !== 'undefined' ? localStorage.getItem('skillbridge_career_path') : null) || 'Data Analyst';
  $('#profileRoleBadge').textContent = profile.role === 'client' ? 'Client' : career;
  $('#profileXpBadge').textContent = profile.role === 'client' ? 'Hiring' : `${profile.xp || 0} XP`;
}

async function load() {
  try { fill(await profileService.get()); }
  catch (error) { showError(error.message); }
}

$('#profileForm').addEventListener('submit', async event => {
  event.preventDefault();
  const fields = {
    name: $('#profileName').value.trim(),
    headline: $('#profileHeadline').value.trim(),
    bio: $('#profileBio').value.trim(),
    location: $('#profileLocation').value.trim(),
    website: $('#profileWebsite').value.trim(),
    skills: parseSkills($('#profileSkills').value)
  };
  if (fields.name.length < 2) return showError('Name must be at least 2 characters.');
  if (fields.website && !/^https?:\/\//i.test(fields.website)) return showError('Website must start with http:// or https://');
  if (fields.skills.length > 30) return showError('You can list up to 30 skills.');
  showError('');

  const button = $('#profileSaveBtn');
  setBusy(button, true, 'Saving…');
  try {
    const profile = await profileService.update(fields);
    if (profile.headline) localStorage.setItem('skillbridge_career_path', profile.headline);
    fill(profile);
    const careerBadge = $('#userCareerBadge');
    if (careerBadge && profile.role !== 'client' && profile.headline) careerBadge.textContent = profile.headline;
    document.querySelectorAll('.user-name').forEach(node => { node.textContent = profile.name; });
    document.querySelectorAll('#sidebarAvatar, #topbarAvatarSm').forEach(node => { node.textContent = initials(profile.name); });
    notify('Profile updated successfully.', 'success');
  } catch (error) {
    showError(error.message);
  } finally {
    setBusy(button, false);
  }
});

if (user) load();
