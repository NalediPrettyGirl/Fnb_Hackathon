import { initShell } from '../components/shell.js';
import { gigService } from '../services/gigs.js';
import { routes } from '../core/routes.js';
import { notify } from '../core/toast.js';
import { ROLES } from '../core/config.js';
import { readQuery, setBusy, $ } from '../core/dom.js';

const user = initShell({ active: 'post-gig', roles: [ROLES.CLIENT] });
const editingId = readQuery('id');

const parseSkills = text => [...new Set(text.split(',').map(skill => skill.trim()).filter(Boolean))];
const showError = message => { const box = $('#gigFormError'); box.textContent = message || ''; box.hidden = !message; };

function validate(data) {
  if (data.title.length < 3 || data.title.length > 120) return 'Title must be between 3 and 120 characters.';
  if (data.description.length < 10) return 'Description must be at least 10 characters.';
  if (!Number.isFinite(data.budget) || data.budget < 0) return 'Budget must be a non-negative number.';
  if (data.skills.length > 20) return 'You can list up to 20 skills.';
  if (data.skills.some(skill => skill.length > 40)) return 'Each skill must be 40 characters or fewer.';
  return '';
}

async function prefill() {
  $('#postGigHeading').textContent = 'Edit Gig';
  $('#gigSubmitBtn').textContent = 'Save changes';
  try {
    const gig = await gigService.get(editingId);
    if (String(gig.postedBy?._id) !== String(user.id)) throw new Error('You can only edit your own gigs.');
    $('#gigTitle').value = gig.title;
    $('#gigDescription').value = gig.description;
    $('#gigBudget').value = gig.budget;
    $('#gigSkills').value = (gig.skills || []).join(', ');
  } catch (error) {
    notify(error.message, 'error');
    window.setTimeout(() => { window.location.href = routes.myGigs; }, 1200);
  }
}

$('#gigForm').addEventListener('submit', async event => {
  event.preventDefault();
  const data = {
    title: $('#gigTitle').value.trim(),
    description: $('#gigDescription').value.trim(),
    budget: Number($('#gigBudget').value),
    skills: parseSkills($('#gigSkills').value)
  };
  const problem = $('#gigBudget').value === '' ? 'Enter a budget.' : validate(data);
  showError(problem);
  if (problem) return;

  const button = $('#gigSubmitBtn');
  setBusy(button, true, 'Saving…');
  try {
    if (editingId) await gigService.update(editingId, data);
    else await gigService.create(data);
    notify(editingId ? 'Gig updated.' : 'Gig posted successfully.', 'success');
    window.setTimeout(() => { window.location.href = routes.myGigs; }, 600);
  } catch (error) {
    showError(error.message);
    setBusy(button, false);
  }
});

if (user && editingId) prefill();
