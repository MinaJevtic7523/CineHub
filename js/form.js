$(document).ready(function () {

  if (!$('#contactForm').length) return;

  $('#contactForm').on('submit', function (e) {
    e.preventDefault();

    const name    = $('#name').val().trim();
    const email   = $('#email').val().trim();
    const subject = $('#subject').val();
    const message = $('#message').val().trim();
    const rating  = $('input[name="rating"]:checked').val();
    const terms   = $('#termsCheckbox').is(':checked');

    let ok = true;

    if (name.length < 2) {
      $('#nameError').text('Name must be at least 2 characters.').show();
      ok = false;
    } else {
      $('#nameError').hide();
    }

    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      $('#emailError').text('Please enter a valid email address.').show();
      ok = false;
    } else {
      $('#emailError').hide();
    }

    if (subject === '' || subject === 'default') {
      $('#subjectError').text('Please select a subject.').show();
      ok = false;
    } else {
      $('#subjectError').hide();
    }

    if (message.length < 10) {
      $('#messageError').text('Message must be at least 10 characters.').show();
      ok = false;
    } else {
      $('#messageError').hide();
    }

    if (!rating) {
      $('#ratingError').text('Please rate the site.').show();
      ok = false;
    } else {
      $('#ratingError').hide();
    }

    if (!terms) {
      $('#termsError').text('You must accept the terms of use.').show();
      ok = false;
    } else {
      $('#termsError').hide();
    }

    if (!ok) {
      showToast('Please fix the errors before submitting.', 'error');
      return;
    }

    const data = {
      name,
      email,
      subject,
      message,
      rating,
      sentAt: new Date().toISOString(),
      id: Date.now()
    };

    const messages = lsLoad('cineHub_messages') || [];
    messages.push(data);
    lsSave('cineHub_messages', messages);

    this.reset();
    $('.field-error').hide();
    showToast('Message sent successfully!', 'success');
  });

  $('#resetFormBtn').on('click', function () {
    $('#contactForm')[0].reset();
    $('.field-error').hide();
    showToast('Form reset.', 'info');
  });

});
