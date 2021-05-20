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
    });
    
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // Stop form from submitting
    return false;

  }  
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

    // forEach version
    emails.forEach(email => {
    
      // Create an element to carry each email
      const element2 = document.createElement('div');
      // Add class
      element2.className = 'list-group-item list-group-item-action';
      // Define content to add
      if (mailbox == 'sent')
        element2.innerHTML = "<div class='d-flex w-100 justify-content-between'>" + "<strong class='mb-1'>" + email['recipients'] + "</strong><p class='mb-1'>" + email['subject'] + "</p><p class='mb-1 text-muted'>" + email['timestamp'] + "</p>" + "</div>";
      else
        element2.innerHTML = "<div class='d-flex w-100 justify-content-between'>" + "<strong class='mb-1'>" + email['sender'] + "</strong><p class='mb-1'>" + email['subject'] + "</p><p class='mb-1 text-muted'>" + email['timestamp'] + "</p>" + "</div>";
      // Define function to open email onclick
      const email_to_get = `${email['id']}`;
      element2.addEventListener('click', function() {
        console.log('This element has been clicked!')
        console.log(email_to_get)
        load_email(email_to_get)
      }); 
      // Add element to the html
      document.querySelector('#email-list').append(element2);
      
    });
  
    
    // For loop version
    // for (i = 0; i < emails.length; i++) {
    //   // Create an element to carry each email
    //   const element2 = document.createElement('div');
    //   // Add class
    //   element2.className = 'list-group-item list-group-item-action';
    //   // Define content to add
    //   element2.innerHTML = "<div class='d-flex w-100 justify-content-between'>" + "<strong class='mb-1'>" + emails[i]['sender'] + "</strong><p class='mb-1'>" + emails[i]['subject'] + "</p><p class='mb-1 text-muted'>" + emails[i]['timestamp'] + "</p>" + "</div>";
    //   // Define function to open email onclick
    //   const email_to_get = `${emails[i]['id']}`;
    //   element2.addEventListener('click', function() {
    //     console.log('This element has been clicked!')
    //     console.log(email_to_get)
    //     load_email(email_to_get)
    //   }); 
    //   // Add element to the html
    //   document.querySelector('#email-list').append(element2);
    // }
        
  });
    
}

function load_email(email_id) {

  // Show the email view and hide the other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-viewer').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Send a GET request to get email data
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ...
    const element3 = document.createElement('div');
    element3.className = '';
    element3.innerHTML = "<strong class='mb-1'>From: </strong>" + email['sender'] + "<br><strong class='mb-1'>To: </strong>" + email['recipients'] + "<br><strong class='mb-1'>Subject: </strong>" + email['subject'] + "<br><strong class='mb-1'>Timestamp: </strong>" + email['timestamp'] + "<br><input type='submit' value='Reply' class='btn btn-sm btn-outline-primary'>" + "<br><hr>" + email['body'];
    document.querySelector('#email-viewer').append(element3);
    
  });
  
  // Clears the appended elements - https://developer.mozilla.org/en-US/docs/Web/API/Node
  while (document.querySelector('#email-viewer').firstChild) {
    document.querySelector('#email-viewer').removeChild(document.querySelector('#email-viewer').firstChild)
  }  
  
}