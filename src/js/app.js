import $ from 'jquery';

//  jQuery UI from node_modules
require('webpack-jquery-ui');
import '../css/style.css';
import 'jquery-ui'
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/selectable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/selectable';
import { runInThisContext } from 'vm';
import { inherits } from 'util';


  /**
 * jtrello
 * @return {Object} [Publikt tillgänliga metoder som vi exponerar]
 */


// Här tillämpar vi mönstret reavealing module pattern:
// Mer information om det mönstret här: https://bit.ly/1nt5vXP
const jtrello = (function () {
  "use strict"; // https://lucybain.com/blog/2014/js-use-strict/


  // Referens internt i modulen för DOM element
  let DOM = {};


  /* =================== Private methods================= */
  function captureDOMEls() {
    DOM.$board = $('.board');
    DOM.$listDialog = $('#list-creation-dialog');
    DOM.$columns = $('.column');
    DOM.$lists = $('.list');
    DOM.$cards = $('.card');
 
    DOM.$newListButton = $('button.new-list');
    DOM.$deleteListButton = $('.list-header > button.delete');

    DOM.$newCardForm = $('form.new-card');
    DOM.$deleteCardButton = $('.card > button.delete');
  }


  
  /**
   * This function makes user able to drag and drop cards, which allows the user to sort the cards and also move the cards between lists/columns
   */
  function dragDropCard() {

    $('.list-cards').sortable({connectWith: '.list-cards', helper: 'clone', cursor:'grabbing',placeholder: 'placeholder-cards',revert: true});
  }

  /**
   * This function makes user able to drag and drop lists, which allows the user to move the list/columns order.
   */
  function dragDropList() {

    $(".board").sortable({connectWith: ".board", helper: "clone" ,cursor:"grabbing",placeholder: "placeholder-lists",revert: true});
  }


  
  /**
  * This method is using the variable DOM to bind eventlisteners to createList, deleteList, createCard and deleteCard etc.
  */
  function bindEvents() {
 
    DOM.$newListButton.on('click', createList);
    DOM.$deleteListButton.on('click', deleteList);

    DOM.$newCardForm.on('submit', createCard);
    DOM.$deleteCardButton.on('click', deleteCard);
  
  }

  
  /* ============== Methods for the lists (columns) ============== */

  /**
   * This creates a new list (column).
   * 
   * @valueListCreation Variable for the list creation title input field's value, that also replaces all the tags in the value with "". 
   * @columnList Variable with the elements for creating a new List / Column with the new value given from the input field for the list title.
   * */ 
  function createList() { 
    event.preventDefault();
    //console.log("This creates a new list/column");
    
    var valueListCreation = $('#list-creation-dialog').find('input').val().replace(/(<([^>]+)>)/ig,"");

    var columnList = (`
    <div class="column ui-sortable-handle">
      <div class="list">
        <div class="list-header"> 
          ${valueListCreation}
          <button class="button delete">✖</button>
        </div>
          <ul class="list-cards">
            <li class="add-new">
              <form class="new-card" action="index.html">
                <input type="text" name="title" placeholder="Create a new card..." />
                <button class="button add">Add</button>
              </form>
            </li>
          </ul>
      </div>
    </div>`);

    //  Inserts the list elements inside the "board-class"'s ending
    $('.board').append(columnList);

    // This fixes the issue I had with not being able to delete new created lists
    $('.list-header > .button.delete').on('click', deleteList);
  
    // This fixes the Issue I had with not being able to delete cards created in the new list
    $('.card > .button.delete').on('click', deleteCard);
   
    // This fixes the issue I had that did deleted the whole list including all new created cards when trying to create card inside the new list
    $('form.new-card').unbind();
    $('form.new-card').on('submit', createCard);
   
    // Set the value of the list creation input to null after submit (clears the input field)
    $('#list-creation-dialog').find('input').val(null);

    // Added to run the dragDropList function again for the new lists to work with the drag drop function
    dragDropList();
    // Added to run the dragDropCard function again for the new lists cards to work with the drag drop function
    dragDropCard();
   
  }

  /**
   * Deletes a list (column)
   * - Removes a with a "droppable effect"
   */
  function deleteList() {
    //console.log("This deletes the list you clicked on");

    $(this).parentsUntil('.board').toggle("droppable", function() {
      $(this).parentsUntil('.board').remove();
    });

  }

 


  /* =========== Methods for the cards inside of the lists (columns)=========== */

  /**
   * * Creates a new card
   * @value variable for the card creation title input field's value  + replaces all the tags in the value with " ".
   * 
   * @randLetter Generates a random letter.
   * @uniqueID Generates a Unique ID with the ranLetter generator and todays date
   * 
   * * - To get back a information button which Opens the dialog when clicked on the "information-button" with the class .dia delete the span with class dia and add back the snippet below in "example"-
   *@example <button class="button dia" style="margin-right: 20px;">ⓘ</button>
   */ 
  function createCard(event) {
    event.preventDefault();
    //console.log("This creates a new card");

    var value = $(this).find('input').val().replace(/(<([^>]+)>)/ig,"");

    const randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const uniqueID = randLetter + Date.now();

  
   
    // Adds a new card on "before" of the input field and after the other cards in the list(colmn) with the value(title) given from the input field and gives the card an unique ID.
    $(this).parent('.add-new').before(`
      <li class="card" id="${uniqueID}"> 
        <span class="dia">
          ${value}
          <div title="${value}" id="${uniqueID}">
          </div>
        </span>
        <button class="button delete">✖</button>
      </li>
    `);

    // Opens the card when clicked on it       
    $(`.card#${uniqueID}`).find('.dia').click(function(){
      $(`div#${uniqueID}`).dialog('open')
    })


    // Prevents the dialog from autoOpen
    $(`div#${uniqueID}`).dialog({ autoOpen: false })
    
    // "Effects" That gives the cards hover effects etc
    let el = $(this).parent().parent().find(`#${uniqueID}`);
    el.on({
      mouseenter: function(){
        el.css("background-color", "lightgray");
      }, 
      mouseleave: function(){
       el.css("background-color", "#ffffff");
      }

    });

    // The dialog with tabs + datepicker + date + Notes
    $(`.ui-dialog-content#${uniqueID}`).html(`
      <ul class="tabs">
        <li><a href="#tabs-2"><i class="fas fa-sticky-note" style="font-size:16px;"></i></a></li>
        <li><a href="#tabs-3"><i class="fas fa-calendar-alt" style="font-size:16px;"></i></a></li>
        <li><a href="#tabs-4"><i class="fas fa-hourglass-start" style="font-size:16px;"></i></a></li>
      </ul>
      <div id="tabs-2">
        <textarea id="${uniqueID}" placeholder="..."></textarea>
      </div>
      <div id="tabs-3">
        <input type="text" class="datep" placeholder="Date:" id="datepicker-${uniqueID}">
      </div>
      <div id="tabs-4">
        <input type="text" class="datep2" placeholder="Deadline:" id="datepicker2-${uniqueID}">
      </div>
    `).tabs();


    // Dateformat for the date tab
    $(`.ui-dialog-content#${uniqueID}`).find(`#datepicker-${uniqueID}`)
    .datepicker({ dateFormat: 'dd ' +'/'+' m / yy' });

    // Dateformat for the deadline
    $(`.ui-dialog-content#${uniqueID}`).find(`#datepicker2-${uniqueID}`)
    .datepicker({ dateFormat: ' D d  M yy' });


    // This fixes the Issue I had with not being able to delete cards created in the new list
    deleteCard();
  
    // Set the value of the card creation input to null after submit (clears the input field)
    $(this).find('input').val(null);

    // The functions for dragDrop List & Card
    dragDropCard();
    dragDropList();
  }


  /**
   * Deletes card
   */
  function deleteCard() {
    console.log("This deletes the card you clicked on");


    // Deletes card when doubleclicked on delete button
    $('.list').on('click', '.delete', function () {
      $(this).parent('.card').remove();
    });

    // //Fades out the card when clicked on delete button
    // $(this).parent('.card').fadeTo(200, 0.4, function() {
    //   $(this).parent('.card')
    // });

  }




  /**
  * @todo At the moment the "dark mode widget toggle" does not implement the darkmode on dialogs and new created cards etc.
  * 
  */
  //Super simple widget for darkMode/lightMode toggle 
  $.widget('kanban.darkMode', {
    _create() {
      $('button.darkMode').click(() => {
        $('body').toggleClass('darkModeBody');
        $('.list , .list-header').toggleClass('darkModeone');
        $('button.new-list').toggleClass('darkModeone');
        $('.darkMode').toggleClass('lightMode');
      });
    }

  });

  $('body').darkMode();

  

  // Metod för att rita ut element i DOM:en
  function render() {}

  /* =================== Publika metoder nedan ================== */

  // Init metod som körs först
  function init() {
    console.log(':::: Initializing jQuery Kanban ~ Esra Oktav ::::');
    // Suggestions for private methods
    captureDOMEls();

  
    dragDropCard();
    dragDropList();

    bindEvents();

  }

  // All code here
  return {
    init: init
  };

})();

//usage
$("document").ready(function() {
  jtrello.init();
});
