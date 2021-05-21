document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-viewer').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Variables to collect form data
  const submit = document.querySelector('#submit');
  const compose_recipients = document.querySelector('#compose-recipients');
  const compose_subject = document.querySelector('#compose-subject');
  const compose_body = document.querySelector('#compose-body');
  
  // Listen for submission of form
  document.querySelector('form').onsubmit = () => {
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: `${compose_recipients.value}`,
        subject: `${compose_subject.value}`,
        body: `${compose_body.value}`
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });

      // Stop form from submitting
      return false;
  };
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-viewer').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send a GET request to get mailbox data
  fetch(`/emails/${mailbox}`)
  // Put response into JSON form
  .then(response => response.json())
  .then(emails => {
    
    // Print emails to console
    // console.log(mailbox);
      
    // Create a container div
    const element1 = document.createElement('div');
    element1.className = "list-group";
    element1.id = "email-list";
    document.querySelector('#emails-view').append(element1);
    
    // Create an element for each email 
    emails.forEach(email => {
    
      // Create an element to carry each email
      const element2 = document.createElement('div');
      // Add class
      element2.className = 'list-group-item list-group-item-action';
      // Define content to add
      if (mailbox == 'sent')
        element2.innerHTML = "<div class='d-flex w-100 justify-content-between'>" + "<strong class='mb-1'>" + email['recipients'] + "</strong><p class='mb-1'>" + email['subject'] + "</p><p class='mb-1 text-muted'>" + email['timestamp'] + "</p>" + "</div>";
      if (mailbox == 'inbox')
        if (email.read == false) {
          element2.innerHTML = "<div class='d-flex w-100 justify-content-between'>" + "<strong class='mb-1'>" + email['sender'] + "</strong><p class='mb-1'>" + email['subject'] + "</p><p class='mb-1 text-muted'>" + email['timestamp'] + "</p>" + "</div>";
        }
        else {
          element2.className = 'list-group-item list-group-item-action unread';
          element2.innerHTML = "<div class='d-flex w-100 justify-content-between'>" + "<strong class='mb-1'>" + email['sender'] + "</strong><p class='mb-1'>" + email['subject'] + "</p><p class='mb-1 text-muted'>" + email['timestamp'] + "</p>" + "</div>";
        }
      if (mailbox == 'archive')
        element2.innerHTML = "<div class='d-flex w-100 justify-content-between'>" + "<strong class='mb-1'>" + email['sender'] + "</strong><p class='mb-1'>" + email['subject'] + "</p><p class='mb-1 text-muted'>" + email['timestamp'] + "</p>" + "</div>";
      // Define function to open email onclick
      const email_to_get = `${email['id']}`;
      element2.addEventListener('click', function() {
        console.log('This element has been clicked!')
        console.log(email_to_get)
        load_email(email_to_get, mailbox)
      }); 
      // Add element to the html
      document.querySelector('#email-list').append(element2);
      
    });
          
  });
    
}

function load_email(email_id, mailbox) {

  // Show the email view and hide the other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-viewer').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Create a div element to house the displayed email
  const element3 = document.createElement('div');
  element3.className = '';
  
  // Send a GET request to get email data
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // Dislpay the email, with different buttons depending on the mailbox
    if (mailbox == 'inbox')
      element3.innerHTML = "<strong class='mb-1'>From: </strong>" + email['sender'] + "<br><strong class='mb-1'>To: </strong>" + email['recipients'] + "<br><strong class='mb-1'>Subject: </strong>" + email['subject'] + "<br><strong class='mb-1'>Timestamp: </strong>" + email['timestamp'] + "<br><button class='btn btn-sm btn-outline-primary' id='reply'>Reply</button><button class='btn btn-sm btn-outline-primary' id='archive'>Archive</button>" + "<br><hr>" + email['body'];
    if (mailbox == 'sent')
      element3.innerHTML = "<strong class='mb-1'>From: </strong>" + email['sender'] + "<br><strong class='mb-1'>To: </strong>" + email['recipients'] + "<br><strong class='mb-1'>Subject: </strong>" + email['subject'] + "<br><strong class='mb-1'>Timestamp: </strong>" + email['timestamp'] + "<br><hr>" + email['body'];
    if (mailbox == 'archive')
      element3.innerHTML = "<strong class='mb-1'>From: </strong>" + email['sender'] + "<br><strong class='mb-1'>To: </strong>" + email['recipients'] + "<br><strong class='mb-1'>Subject: </strong>" + email['subject'] + "<br><strong class='mb-1'>Timestamp: </strong>" + email['timestamp'] + "<br><button class='btn btn-sm btn-outline-primary' id='undisdearchive'>Undisdearchive</button>" + "<br><hr>" + email['body'];
    
    // Append the created element to the identified element in inbox.html
    document.querySelector('#email-viewer').append(element3);
    
    // Mark the email as read, if it is unread
    if (email.read == false) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }
    
    // React to reply, archive, and undisdearchive buttons
    if (mailbox == 'inbox') {
      // Add a listener to the reply button
      element3.querySelector('#reply').addEventListener('click', () => {
        console.log('foo')
        console.log(email)
        reply_email(email)
      });
      // Add a listener to the archive button
      element3.querySelector('#archive').addEventListener('click', () => {
        console.log('bar')
        // PUT request to update archived status
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        // Load and refresh inbox
        load_mailbox('inbox');
        location.reload();
      });
    };
    if (mailbox == 'archive') {
      // Add a listener to the undisdearchive button
      element3.querySelector('#undisdearchive').addEventListener('click', () => {
        console.log('baz')
        // PUT request to update archived status
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        // Load and refresh inbox
        load_mailbox('inbox');
        location.reload();
      });
    }
    
  });
  
  // Clears the appended elements - https://developer.mozilla.org/en-US/docs/Web/API/Node
  while (document.querySelector('#email-viewer').firstChild) {
    document.querySelector('#email-viewer').removeChild(document.querySelector('#email-viewer').firstChild)
  }   
  
}

// ! Here...

function reply_email(email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-viewer').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Variables to populate form
  const compose_recipients = email.sender;
  const compose_subject = `RE: ${email.subject}`;
  const compose_body = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  
  console.log(compose_recipients);
  console.log(compose_subject);
  console.log(compose_body);

  // Variables to collect form data
  // const submit = document.querySelector('#submit');
  // const compose_recipients = document.querySelector('#compose-recipients');
  // const compose_subject = document.querySelector('#compose-subject');
  // const compose_body = document.querySelector('#compose-body');
  
  // Listen for submission of form
  document.querySelector('form').onsubmit = () => {
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: `${compose_recipients.value}`,
        subject: `${compose_subject.value}`,
        body: `${compose_body.value}`
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });

      // Stop form from submitting
      return false;
  };
  
}