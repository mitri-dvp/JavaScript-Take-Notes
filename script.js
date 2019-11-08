// Elements
const takeNotes = document.querySelector('.take-notes');
const noteDiv = takeNotes.querySelector('.note-div');
const sideBar = document.querySelector('.side-bar');
const sideBarBtns = sideBar.querySelectorAll('span');
let sideBarMain = takeNotes.querySelector('.side-bar main');
let sideBarMainChildren = [...sideBarMain.children];
const addNoteBtn = document.querySelector('.note-div .btn-add');
const delNoteBtn = document.querySelector('.note-div .btn-remove');
const saveNoteBtn = document.querySelector('.note-div .btn-save');
const utlBtns = [...document.querySelector('.utilities').children];
const algnBtns = [...document.querySelector('.align').children];

let isDragging = false;
let x = 0;
let y = 0;
let z = 0;
let hold;
let currentNote;
let tik = 0;
let emptyNote = document.createElement('div');

// Grab Listeners
takeNotes.addEventListener('mousedown', e => {
  if (e.target.className.match('paper')) {
    currentNote = e.target;
    hold = setTimeout(changeFlag, 200, e);
    currentNote.addEventListener('mouseout', () => {
      clearTimeout(hold);
    });
    dragNote(e);
  } else {
    saveNotes();
    return 0;
  }
});
takeNotes.addEventListener('mouseup', e => {
  emptyNote.remove();
  clearTimeout(hold);
  if (isDragging) {
    placeNote(e);
  }
  isDragging = false;
  tik = 0;
});
takeNotes.addEventListener('mousemove', dragNote);

// Listeners
sideBarBtns.forEach(btn => btn.addEventListener('mousedown', scrollSideBar));
addNoteBtn.addEventListener('click', addNote);
delNoteBtn.addEventListener('click', delNote);
saveNoteBtn.addEventListener('click', saveNotes);

// Utilities
utlBtns[0].addEventListener('click', textBold); // bold
utlBtns[1].addEventListener('click', textUnderline); // underline
utlBtns[2].addEventListener('click', textItalic); // italic
utlBtns[3].addEventListener('click', textBullet); // bullet

// Align
algnBtns[0].addEventListener('click', textLeft); // left
algnBtns[1].addEventListener('click', textCenter); // center
algnBtns[2].addEventListener('click', textRight); // right

// On load
document.addEventListener('DOMContentLoaded', displayNotes);

// Functions
function changeFlag(e) {
  if (window.getSelection().focusOffset != window.getSelection().baseOffset) {
    return;
  }
  e.target.blur();
  isDragging = true;
  placeEmpty();
  dragNote(e);
}

function dragNote(e) {
  if (!isDragging) {
    return;
  }
  const scroll = sideBar.querySelector('main').scrollTop;
  if (e.target.className.match('paper')) {
    x = e.offsetX;
    y = e.offsetY;
  } else {
    x = e.offsetX;
    y = e.offsetY + e.target.offsetTop;
  }
  z++;
  const width = currentNote.offsetWidth;
  const height = currentNote.offsetHeight;
  currentNote.style.width = `${width}px`;
  currentNote.style.minHeight = `${height}px`;
  y += currentNote.offsetTop;
  x += currentNote.offsetLeft;
  currentNote.style.position = 'absolute';
  tik++;
  if (tik > 1) {
    currentNote.style.top = `${y - currentNote.offsetHeight / 2}px`;
  } else {
    if(currentNote.parentElement.parentElement.className.match('side-bar')) {
      currentNote.style.top = `${y - currentNote.offsetHeight / 2 - scroll}px`;
    }
  }
  currentNote.style.left = `${x - currentNote.offsetWidth / 2}px`;
  currentNote.style.zIndex = z;
  currentNote.style.transform = 'scale(1.05)';
  currentNote.style.opacity = '0.8';
  if (x + sideBar.offsetWidth < sideBar.offsetWidth) {
    currentNote.classList.add('inside');
    currentNote.setAttribute('contenteditable', false);
  } else {
    currentNote.classList.remove('inside');
    currentNote.setAttribute('contenteditable', true);
  }
  if(currentNote.parentElement.parentElement.className.match('side-bar')){
    if (x < sideBar.offsetWidth) {
      currentNote.classList.add('inside');
      currentNote.setAttribute('contenteditable', false);
    } else {
      currentNote.classList.remove('inside');
      currentNote.setAttribute('contenteditable', true);
    }
  }
}

function placeEmpty() {
  sideBarMain = takeNotes.querySelector('.side-bar main');
  sideBarMainChildren = [...sideBarMain.children];
  emptyNote = document.createElement('div');
  emptyNote = currentNote.cloneNode(true);
  emptyNote.innerHTML = '';
  emptyNote.style.opacity = '0.5';
  sideBarMainChildren.forEach((child, i) => {
    if (child === currentNote) {
      sideBarMain.insertBefore(emptyNote, sideBarMainChildren[i]);
    }
  });
}

function placeNote() {
  const noteDivChildren = [...takeNotes.querySelector('.note-div').children];
  const noteDivFiltered = noteDivChildren.filter(e => e.className.match('paper'));
  if (!currentNote.className.match('paper')) {
    return;
  }
  if (currentNote.className.match('inside')) {
    resetStyle(currentNote);
    const sideBarOffset = sideBarMain.scrollTop + (y - sideBarMain.offsetTop);
    let palced = false;
    if (sideBarMainChildren.length == 0) {
      sideBarMain.appendChild(currentNote);
      saveNotes();
    }
    sideBarMainChildren.forEach((child, i) => {
      if (!palced) {
        if (!sideBarMainChildren[i + 1]) {
          if (sideBarMainChildren.length <= 2) {
            sideBarMain.appendChild(currentNote);
            saveNotes();
          }
          return;
        }
        const childHeight = child.offsetTop + child.offsetHeight / 2;
        const nextChildHeight = sideBarMainChildren[i + 1].offsetTop + sideBarMainChildren[i + 1].offsetHeight / 2;
        if (sideBarOffset > childHeight && sideBarOffset < nextChildHeight) {
          palced = true;
          sideBarMain.insertBefore(currentNote, sideBarMainChildren[i + 1]);
          console.log('placed in side')
          saveNotes();
          return 0;
        }
      }
    });
    currentNote.style.zIndex = '0';
    z--;
    return;
  }
  resetStyle(currentNote);
  if (noteDivFiltered.length > 0) {
    sideBar.querySelector('main').appendChild(noteDivFiltered[0]);
    saveNotes();
  }
  takeNotes.querySelector('.note-div').appendChild(currentNote);
  saveNotes();
  currentNote.style.zIndex = '0';
  z--;
}

function resetStyle(note) {
  note.style.position = 'relative';
  note.style.top = `0px`;
  note.style.left = `0px`;
  note.style.width = ``;
  note.style.minHeight = ``;
  note.style.transform = 'scale(1)';
  note.style.opacity = '1';
}

// Sidebar //
function scrollSideBar() {
  const scroll = sideBar.querySelector('main');
  if (this.className.match('btn-top')) {
    scroll.scrollTop -= 150;
  }
  if (this.className.match('btn-bot')) {
    scroll.scrollTop += 150;
  }
  if (this.className.match('btn-open')) {
    sideBar.classList.toggle('close')
  }

}

function addNote() {
  const noteDivChildren = [...noteDiv.children];
  const noteDivFiltered = noteDivChildren.filter(e => e.className.match('paper'));
  if (noteDivFiltered.length == 0) {
    const newNote = document.createElement('div');
    newNote.classList.add('paper');
    newNote.setAttribute('spellcheck', 'false');
    newNote.setAttribute('contenteditable', 'true');
    newNote.innerHTML = '<h2>enter title...</h2>';
    noteDiv.appendChild(newNote);
  }
}

function delNote(e, answer) {
  const noteDivChildren = [...noteDiv.children];
  const noteDivFiltered = noteDivChildren.filter(e => e.className.match('paper'));
  if (noteDivFiltered.length > 0) {
    confirmDelete(noteDivFiltered[0]);
  }
}
function confirmDelete(note) {
  const modal = document.createElement('div');
  modal.innerHTML = `
  <div class="confirm-delete">
    <div class="question">
      <h2>Are you sure?</h2>
      <div class="btns">
        <button class="true">&check;</button>
        <button class="false">X</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.querySelector('.btns .true').addEventListener('click', () => {
    modal.remove();
    note.remove();
  });
  document.querySelector('.btns .false').addEventListener('click', () => {
    modal.remove();
  });
}

// Utilities Functions
// Checks that selection is on a note
function chkFocus() {
  const focusParent = window.getSelection().focusNode.parentElement;
  if (
    focusParent.className.match('paper') ||
    focusParent.parentElement.className.match('paper') ||
    focusParent.parentElement.parentElement.className.match('paper') ||
    focusParent.parentElement.parentElement.parentElement.className.match('paper') ||
    focusParent.parentElement.parentElement.parentElement.parentElement.className.match('paper')
  ) {
    return true;
  }
}
function textBold() {
  if (chkFocus()) {
    if(window.getSelection().focusNode.parentElement.style.fontWeight === 'bold') {
      window.getSelection().focusNode.parentElement.style.fontWeight = 'normal'
    } else {
      window.getSelection().focusNode.parentElement.style.fontWeight = 'bold'
    }
  }
}
function textUnderline() {
  if (chkFocus()) {
    if(window.getSelection().focusNode.parentElement.style.textDecoration === 'underline') {
      window.getSelection().focusNode.parentElement.style.textDecoration = 'none'
    } else {
      window.getSelection().focusNode.parentElement.style.textDecoration = 'underline'
    }
  }
}
function textItalic() {
  if (chkFocus()) {
    if(window.getSelection().focusNode.parentElement.style.fontStyle === 'italic') {
      window.getSelection().focusNode.parentElement.style.fontStyle = 'normal'
    } else {
      window.getSelection().focusNode.parentElement.style.fontStyle = 'italic'
    }
  }
}
function textBullet() {
  if (chkFocus()) {
    const { focusNode } = window.getSelection();
    if (focusNode.textContent.match('•')) {
      focusNode.textContent = focusNode.textContent.substring(3);
      return;
    }
    focusNode.textContent = `•  ${focusNode.textContent}`;
  }
}

// Align Functions
function textLeft() {
  if (chkFocus()) {
    if(window.getSelection().focusNode.parentElement.className.match('paper')) {
      window.getSelection().focusNode.parentElement.style.textAlign = 'left';
    } else {
      window.getSelection().focusNode.parentElement.style.textAlign = 'left';
      window.getSelection().focusNode.parentElement.style.margin = '0 auto 0 0';
    }
  }
}
function textCenter() {
  if (chkFocus()) {
    if(window.getSelection().focusNode.parentElement.className.match('paper')) {
      window.getSelection().focusNode.parentElement.style.textAlign = 'center';
    } else {
      window.getSelection().focusNode.parentElement.style.textAlign = 'center';
      window.getSelection().focusNode.parentElement.style.margin = '0 auto';
    }
  }
}
function textRight() {
  if (chkFocus()) {
    if(window.getSelection().focusNode.parentElement.className.match('paper')) {
      window.getSelection().focusNode.parentElement.style.textAlign = 'right';
    } else {
      window.getSelection().focusNode.parentElement.style.textAlign = 'right';
      window.getSelection().focusNode.parentElement.style.margin = '0 0 0 auto';
    }
  }
}

function chkNoteDiv() {
  const noteDivChildren = [...takeNotes.querySelector('.note-div').children];
  const noteDivFiltered = noteDivChildren.filter(e => e.className.match('paper'));
  if(noteDivFiltered.length == 0) {
    console.log('empty')
  } else {
    console.log('not empty')
  }
}

// Display notes and Local storage
function displayNotes() {
  const noteDivPaper = noteDiv.querySelector('.paper');
  if (localStorage.getItem('noteDiv')) {
    noteDivPaper.innerHTML = localStorage.getItem('noteDiv');
  } else {
    noteDivPaper.innerHTML = `
    <h2>enter title...</h2>
    `;
  }

  if (localStorage.getItem('sideBar')) {
    sideBarMain.innerHTML = localStorage.getItem('sideBar');
  } else {
    sideBarMain.innerHTML = `
    `;
  }
}

// Saves Notes
function saveNotes() {
  const noteDivPaper = noteDiv.querySelector('.paper');
  if (noteDivPaper) {
    localStorage.setItem('noteDiv', noteDivPaper.innerHTML);
  } else {
    localStorage.setItem('noteDiv', '');
  }
  localStorage.setItem('sideBar', sideBarMain.innerHTML);
}

// Moves a note up the list -unused-
function moveUp() {
  const sideBarOffset = sideBarMain.scrollTop + (y - sideBarMain.offsetTop);
  sideBarMainChildren.forEach((child, i) => {
    if (child === currentNote) {
      sideBarMain.insertBefore(note, sideBarMainChildren[i + 2]);
    }
  });
}