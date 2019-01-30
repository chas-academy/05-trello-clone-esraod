import $ from 'jquery';

//  jQuery UI from node_modules
require('webpack-jquery-ui');
import '../css/style.css';
import { runInThisContext } from 'vm';
import { inherits } from 'util';

/**
 * jtrello
 * @return {Object} [Publikt tillgänliga metoder som vi exponerar]
 */

// Här tillämpar vi mönstret reavealing module pattern:
// Mer information om det mönstret här: https://bit.ly/1nt5vXP
const jtrello = (function() {
  "use strict"; // https://lucybain.com/blog/2014/js-use-strict/

  // Referens internt i modulen för DOM element
  let DOM = {};

  /* =================== Privata metoder nedan ================= */
  function captureDOMEls() {
    DOM.$board = $('.board');
    DOM.$listDialog = $('#list-creation-dialog');
    DOM.$columns = $('.column');
    DOM.$lists = $('.list');
    DOM.$cards = $('.card');
    
    DOM.$newListButton = $('button#new-list');
    DOM.$deleteListButton = $('.list-header > button.delete');

    DOM.$newCardForm = $('form.new-card');
    DOM.$deleteCardButton = $('.card > button.delete');

  }

  function createTabs() {}
  function createDialogs() {}

  function dragDropCard(){

    // This function makes user able to drag and drop cards, which allows the user to sort the cards and also move the cards between lists/columns
    $(".list-cards").sortable({connectWith: ".list-cards", helper: "clone", cursor:"grabbing",placeholder: "placeholder-cards",revert: true});
  }

  function dragDropList(){

    // This function makes user able to drag and drop lists, which allows the user to move the list/columns order
    $(".board").sortable({connectWith: ".board", helper: "clone", cursor:"grabbing",placeholder: "placeholder-lists",revert: true});
  }

  function effekter () {
    $(".card").on({
      mouseenter: function(){
        $(this).css("background-color", "lightgray");
      }, 
      mouseleave: function(){
        $(this).css("background-color", "#ffffff");
      }, 
      click: function(){
        $(this).css("height", "100px", "background-color", "#ffffff");
      },
      dblclick: function(){
        $(this).css("height", "16px");
      }

    });
  }


  /*
  *  Denna metod kommer nyttja variabeln DOM för att binda eventlyssnare till
  *  createList, deleteList, createCard och deleteCard etc.
  */
  function bindEvents() {
    DOM.$newListButton.on('click', createList);
    DOM.$deleteListButton.on('click', deleteList);

    DOM.$newCardForm.on('submit', createCard);
    DOM.$deleteCardButton.on('click', deleteCard);
  }


  /* ============== Methods for the lists (columns) ============== */

  // Creates a new list (column)
  function createList() { 
    event.preventDefault();
    console.log("This creates a new list column");

    // variable for the list creation title input field's value
    var valueListCreation = $('#list-creation-dialog').find('input').val();
    
    // variable with the elements for creating a new List / Column with the new value given from the input field for the list title
    var columnList = ('<div class="column ui-sortable-handle"><div class="list"><div class="list-header">'+ valueListCreation +'<button class="button delete">X</button></div><ul class="list-cards"><li class="card">Just for trying<button class="button delete">X</button></li><li class="add-new"><form class="new-card" action="index.html"><input type="text" name="title" placeholder="Please name the new card" /><button class="button add">Add new card</button></form></li></ul></div></div>');


    //  Inserts the list elements inside the "board-class"'s ending
    $('.board').append(columnList);

    
    // This fixes the issue I had with not being able to delete new created lists
    $('.list-header > .button.delete').on('click', deleteList);
  
    // This fixes the Issue I had with not being able to delete cards created in the new list
    $('.card > .button.delete').on('click', deleteCard);
   
    // This fixes the issue I had that did deleted the whole list including all new created cards when trying to create card inside the new list
    $('form.new-card').on('click', createCard);
    

    
    // Set the value of the list creation input to null after submit (clears the input field)
    $('#list-creation-dialog').find('input').val(null);
      
   
    // Added to run the dragDropList function again for the new lists to work with the drag drop function
    dragDropList();
    // Added to run the dragDropCard function again for the new lists cards to work with the drag drop function
    dragDropCard();

   
  }


  // Deletes a list (column)
  function deleteList() {
    console.log("This deletes the list you clicked on");

    $(this).parentsUntil('.board').fadeOut(900, function() {
      $(this).parentsUntil('.board').remove();
    });
    /*
    // Deletes list when doubleclicked on delete button
    $('.column').on('dblclick', '.delete', function () {
      $(this).parentsUntil('.board').remove();
    });

    // Fades out the list when click on delete button
    $(this).parentsUntil('.board').fadeTo(200, 1.4, function() {
      $(this).parentsUntil('.board')
    });
    */

  }

 


  /* =========== Methods for the cards inside of the lists (columns)=========== */

  // Creates a new card
  function createCard(event) {
    event.preventDefault();
    console.log("This creates a new card");

    // variable for the card creation title input field's value
    var value = $(this).find('input').val();

    // Adds a new card on "before" of the input field and after the other cards in the list(colmn) with the value(title) given from the input field
    $(this).parent('.add-new').before('<li class="card">'+ value + '<button class="button delete">X</button>' + '</li>');

    // Set the value of the card creation input to null after submit (clears the input field)
    $(this).find('input').val(null);

   dragDropCard();
   dragDropList();
  }


  // Deletes a card 
  function deleteCard() {
    console.log("This deletes the card you clicked on");

    // Deletes card when doubleclicked on delete button
    $('.list').on('dblclick', '.delete', function () {
      $(this).parent('.card').remove();
    });


    // Fades out the card when clicked on delete button
    $(this).parent('.card').fadeTo(200, 0.4, function() {
      $(this).parent('.card')
    });

  }

 

  // Metod för att rita ut element i DOM:en
  function render() {}

  /* =================== Publika metoder nedan ================== */

  // Init metod som körs först
  function init() {
    console.log(':::: Initializing jQuery Kanban ~ Esra Oktav ::::');
    // Suggestions for private methods
    captureDOMEls();
    createTabs();
    createDialogs();

    dragDropCard();
    dragDropList();
    effekter();

    bindEvents();
    
   
  }

  // All kod här
  return {
    init: init
  };
})();

//usage
$("document").ready(function() {
  jtrello.init();
});
