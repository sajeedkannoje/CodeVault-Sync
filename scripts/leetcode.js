/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./scripts/leetcode/util.js
/** Enum for languages supported by LeetCode. */
const languages = Object.freeze({
  C: '.c',
  'C++': '.cpp',
  'C#': '.cs',
  Dart: '.dart',
  Elixir: '.ex',
  Erlang: '.erl',
  Go: '.go',
  Java: '.java',
  JavaScript: '.js',
  Javascript: '.js',
  Kotlin: '.kt',
  MySQL: '.sql',
  'MS SQL Server': '.sql',
  Oracle: '.sql',
  Pandas: '.py',
  PHP: '.php',
  Python: '.py',
  Python3: '.py',
  Racket: '.rkt',
  Ruby: '.rb',
  Rust: '.rs',
  Scala: '.scala',
  Swift: '.swift',
  TypeScript: '.ts',
});

/** @enum */
const DIFFICULTY = Object.freeze({
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  UNKNOWN: 'Unknown',
});

class util_CodeVaultError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CodeVaultErr';
  }
}

function isEmptyObject(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function assert(truthy, msg) {
  if (!truthy) {
    throw new util_CodeVaultError(msg);
  }
}

/**
 * Returns a function that can be immediately invoked but will start
 * a timeout of 'wait' milliseconds before it can be called again.
 * @param {Function} func to be called after wait
 * @param {number} wait time in ms
 * @param {boolean} invokeBeforeTimeout true if you want to invoke func before waiting
 * @returns {Function}
 */
function debounce(func, wait, invokeBeforeTimeout) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!invokeBeforeTimeout) func.apply(context, args);
    };
    const callNow = invokeBeforeTimeout && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Delays the execution of a function by the specified time (in milliseconds)
 * and then executes the function with the provided arguments.
 *
 * @param {Function} func - The function to be executed after the delay.
 * @param {number} wait - The number of milliseconds to wait before executing the function.
 * @param {...*} [args] - Additional arguments to pass to the function when it is called.
 * @returns {Promise<*>} A promise that resolves with the result of the function execution.
 */
function delay(func, wait, ...args) {
  return new Promise(resolve => setTimeout(() => resolve(func(...args)), wait));
}

/**
 *
 * @returns {chrome | browser} namespace of browser extension api
 */
function getBrowser() {
  if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
    return chrome;
  } else if (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') {
    return browser;
  } else {
    throw new util_CodeVaultError('BrowserNotSupported');
  }
}

/**
 * Returns the difficulty in PascalCase for a given difficulty
 * @param {string} difficulty - The difficulty level as a string: "easy", "medium", "hard", etc.
 * @returns {string} - The difficulty level in PascalCase: "Easy", "Medium", or "Hard" or "Unknown" for unrecognized values.
 */
function getDifficulty(difficulty) {
  difficulty &&= difficulty.toUpperCase().trim();
  return DIFFICULTY[difficulty] ?? DIFFICULTY.UNKNOWN;
}

/**
 * Checks if an HTML Collection exists and has elements
 * @param {HTMLCollectionOf<Element>} elem
 * @returns
 */
function checkElem(elem) {
  return elem && elem.length > 0;
}

/** @param {string} string @returns {string} problem slug, e.g. 0001-two-sum */
function convertToSlug(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

function addLeadingZeros(title) {
  const maxTitlePrefixLength = 4;
  var len = title.split('-')[0].length;
  if (len < maxTitlePrefixLength) {
    return '0'.repeat(4 - len) + title;
  }
  return title;
}

function formatStats(time, timePercentile, space, spacePercentile) {
  return `Time: ${time} (${timePercentile}%), Space: ${space} (${spacePercentile}%) - CodeVault`;
}

function isObject(obj) {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

function mergeDeep(target, source) {
  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) {
        Object.assign(target, { [key]: {} });
      }
      mergeDeep(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
}

function mergeStats(obj1, obj2) {
  function countDifficulties(shas) {
    const difficulties = { easy: 0, medium: 0, hard: 0, solved: 0 };
    for (const problem in shas) {
      if ('difficulty' in shas[problem]) {
        const difficulty = shas[problem].difficulty;
        if (difficulty in difficulties) {
          difficulties[difficulty]++;
        }
      }
    }
    for (let value of Object.values(difficulties)) {
      difficulties.solved += value;
    }
    return difficulties;
  }

  const merged = {};
  mergeDeep(merged, obj1);
  mergeDeep(merged, obj2);

  const shas = merged.shas || {};
  const difficulties = countDifficulties(shas);

  merged.easy = difficulties.easy;
  merged.medium = difficulties.medium;
  merged.hard = difficulties.hard;
  merged.solved = difficulties.solved;

  return merged;
}



;// ./scripts/leetcode/versions.js


/*
 * V1 - old UI functionality
 * V2 - new UI functionality
 */
function LeetCodeV1() {
  this.difficulty;
  this.progressSpinnerElementId = 'codevault_progress_elem';
  this.progressSpinnerElementClass = 'codevault_progress';
  this.injectSpinnerStyle();
}
LeetCodeV1.prototype.init = async function () {};
/* Function for finding and parsing the full code. */
/* - At first find the submission details url. */
/* - Then send a request for the details page. */
/* - Parse the code from the html reponse. */
/* - Parse the stats from the html response (explore section) */
LeetCodeV1.prototype.findCode = function (commitMsg) {
  // Get the submission details url from the submission page.
  let submissionURL;
  const e = document.getElementsByClassName('status-column__3SUg');
  if (checkElem(e)) {
    // for normal problem submisson
    const submissionRef = e[1].innerHTML.split(' ')[1];
    submissionURL = 'https://leetcode.com' + submissionRef.split('=')[1].slice(1, -1);
  } else {
    // for a submission in explore section
    const submissionRef = document.getElementById('result-state');
    submissionURL = submissionRef.href;
  }

  if (submissionURL == undefined) {
    return;
  }
  /* Request for the submission details page */
  return fetch(submissionURL)
    .then(res => {
      if (res.status == 200) {
        return res.text();
      } else {
        throw new Error('' + res.status);
      }
    })
    .then(responseText => {
      const doc = new DOMParser().parseFromString(responseText, 'text/html');
      /* the response has a js object called pageData. */
      /* Pagedata has the details data with code about that submission */
      const scripts = doc.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const text = scripts[i].innerText;
        if (text.includes('pageData')) {
          /* Extract the full code */
          const firstIndex = text.indexOf('submissionCode');
          const lastIndex = text.indexOf('editCodeUrl');
          let slicedText = text.slice(firstIndex, lastIndex);
          /* slicedText has form "submissionCode: 'Details code'" */
          /* Find the index of first and last single inverted coma. */
          const firstInverted = slicedText.indexOf("'");
          const lastInverted = slicedText.lastIndexOf("'");
          /* Extract only the code */
          const codeUnicoded = slicedText.slice(firstInverted + 1, lastInverted);
          /* The code has some unicode. Replacing all unicode with actual characters */
          const code = codeUnicoded.replace(/\\u[\dA-F]{4}/gi, function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });

          /* For a submission in explore section we do not get probStat beforehand.
              So, parse statistics from submisson page */
          if (!commitMsg) {
            slicedText = text.slice(text.indexOf('runtime'), text.indexOf('memory'));
            const resultRuntime = slicedText.slice(
              slicedText.indexOf("'") + 1,
              slicedText.lastIndexOf("'")
            );
            slicedText = text.slice(text.indexOf('memory'), text.indexOf('total_correct'));
            const resultMemory = slicedText.slice(
              slicedText.indexOf("'") + 1,
              slicedText.lastIndexOf("'")
            );
            commitMsg = `Time: ${resultRuntime}, Memory: ${resultMemory} - CodeVault`;
          }

          if (code != null) {
            return code;
          }
        }
      }
    });
};
/** @returns {languages} */
LeetCodeV1.prototype.getLanguageExtension = function () {
  const tag = [
    ...document.getElementsByClassName('ant-select-selection-selected-value'),
    ...document.getElementsByClassName('Select-value-label'),
  ];
  if (tag && tag.length > 0) {
    for (let i = 0; i < tag.length; i += 1) {
      const elem = tag[i].textContent;
      if (elem !== undefined && languages[elem] !== undefined) {
        return languages[elem];
      }
    }
  }
  return null;
};
/* function to get the notes if there is any
   the note should be opened atleast once for this to work
   this is because the dom is populated after data is fetched by opening the note */
LeetCodeV1.prototype.getNotesIfAny = function () {
  // there are no notes on expore
  if (document.URL.startsWith('https://leetcode.com/explore/')) return '';

  let notes = '';
  if (
    checkElem(document.getElementsByClassName('notewrap__eHkN')) &&
    checkElem(
      document.getElementsByClassName('notewrap__eHkN')[0].getElementsByClassName('CodeMirror-code')
    )
  ) {
    let notesdiv = document
      .getElementsByClassName('notewrap__eHkN')[0]
      .getElementsByClassName('CodeMirror-code')[0];
    if (notesdiv) {
      for (i = 0; i < notesdiv.childNodes.length; i++) {
        if (notesdiv.childNodes[i].childNodes.length == 0) continue;
        const text = notesdiv.childNodes[i].childNodes[0].innerText;
        if (text) {
          notes = `${notes}\n${text.trim()}`.trim();
        }
      }
    }
  }
  return notes.trim();
};
// Returns a slugged num+title variation e.g. 0001-two-sum
LeetCodeV1.prototype.getProblemNameSlug = function () {
  const questionElem = document.getElementsByClassName('content__u3I1 question-content__JfgR');
  const questionDescriptionElem = document.getElementsByClassName('question-description__3U1T');
  let questionTitle = 'unknown-problem';
  if (checkElem(questionElem)) {
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerHTML;
    }
  } else if (checkElem(questionDescriptionElem)) {
    let qtitle = document.getElementsByClassName('question-title');
    if (checkElem(qtitle)) {
      questionTitle = qtitle[0].innerText;
    }
  }
  return addLeadingZeros(convertToSlug(questionTitle));
};
/* Gets the success state of the solution and updates html elements with new classes */
LeetCodeV1.prototype.getSuccessStateAndUpdate = function () {
  const successTag = document.getElementsByClassName('success__3Ai7');
  const resultState = document.getElementById('result-state');

  // check success state for a normal problem
  if (
    checkElem(successTag) &&
    successTag[0].className === 'success__3Ai7' &&
    successTag[0].innerText.trim() === 'Success'
  ) {
    console.log('[CodeVault Sync]', successTag[0]);
    successTag[0].classList.add('marked_as_success');
    return true;
  }
  // check success state for a explore section problem
  else if (
    resultState &&
    resultState.className === 'text-success' &&
    resultState.innerText === 'Accepted'
  ) {
    resultState.classList.add('marked_as_success');
    return true;
  }

  return false;
};
/* Parser function for time/space stats */
LeetCodeV1.prototype.parseStats = function () {
  const probStats = document.getElementsByClassName('data__HC-i');
  if (!checkElem(probStats)) {
    return null;
  }
  const time = probStats[0].textContent;
  const timePercentile = probStats[1].textContent;
  const space = probStats[2].textContent;
  const spacePercentile = probStats[3].textContent;

  return `Time: ${time} (${timePercentile}), Space: ${space} (${spacePercentile}) - CodeVault`;
};
/* Parser function for the question, question title, question difficulty, and tags */
LeetCodeV1.prototype.parseQuestion = function () {
  let questionUrl = window.location.href;
  if (questionUrl.endsWith('/submissions/')) {
    questionUrl = questionUrl.substring(0, questionUrl.lastIndexOf('/submissions/') + 1);
  }
  const questionElem = document.getElementsByClassName('content__u3I1 question-content__JfgR');
  const questionDescriptionElem = document.getElementsByClassName('question-description__3U1T');
  if (checkElem(questionElem)) {
    const qbody = questionElem[0].innerHTML;

    // Problem title.
    let qtitle = document.getElementsByClassName('css-v3d350');
    if (checkElem(qtitle)) {
      qtitle = qtitle[0].innerHTML;
    } else {
      qtitle = 'unknown-problem';
    }

    // Problem difficulty, each problem difficulty has its own class.
    const isHard = document.getElementsByClassName('css-t42afm');
    const isMedium = document.getElementsByClassName('css-dcmtd5');
    const isEasy = document.getElementsByClassName('css-14oi08n');

    if (checkElem(isEasy)) {
      this.difficulty = getDifficulty('easy');
    } else if (checkElem(isMedium)) {
      this.difficulty = getDifficulty('medium');
    } else if (checkElem(isHard)) {
      this.difficulty = getDifficulty('hard');
    } else {
      this.difficulty = getDifficulty(null);
    }
    // Final formatting of the contents of the README for each problem
    const markdown = `<h2><a href="${questionUrl}">${qtitle}</a></h2><h3>${difficulty}</h3><hr>${qbody}`;
    return markdown;
  } else if (checkElem(questionDescriptionElem)) {
    let questionTitle = document.getElementsByClassName('question-title');
    if (checkElem(questionTitle)) {
      questionTitle = questionTitle[0].innerText;
    } else {
      questionTitle = 'unknown-problem';
    }

    const questionBody = questionDescriptionElem[0].innerHTML;
    const markdown = `<h2>${questionTitle}</h2><hr>${questionBody}`;

    return markdown;
  }
};
/* Injects a spinner on left side to the "Run Code" button */
LeetCodeV1.prototype.startSpinner = function () {
  try {
    let elem = document.getElementById('codevault_progress_anchor_element');
    if (!elem) {
      elem = document.createElement('span');
      elem.id = 'codevault_progress_anchor_element';
      elem.style = 'margin-right: 20px;padding-top: 2px;';
    }
    elem.innerHTML = `<div id="${this.progressSpinnerElementId}" class="${this.progressSpinnerElementClass}"></div>`;
    this.insertToAnchorElement(elem);
  } catch (error) {
    console.log('[CodeVault Sync]', error);
  }
};
/* Injects css style required for the upload progress indicator */
LeetCodeV1.prototype.injectSpinnerStyle = function () {
  const style = document.createElement('style');
  style.textContent = `.${this.progressSpinnerElementClass} {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}`;
  document.head.append(style);
};
/* Inserts an anchor element that is specific to the page you are on (e.g. Explore) */
LeetCodeV1.prototype.insertToAnchorElement = function (elem) {
  if (document.URL.startsWith('https://leetcode.com/explore/')) {
    const action = document.getElementsByClassName('action');
    if (
      checkElem(action) &&
      checkElem(action[0].getElementsByClassName('row')) &&
      checkElem(action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6')) &&
      action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6').length > 1
    ) {
      target = action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6')[1];
      elem.className = 'pull-left';
      if (target.childNodes.length > 0) target.childNodes[0].prepend(elem);
    }
  } else {
    if (checkElem(document.getElementsByClassName('action__38Xc'))) {
      let target = document.getElementsByClassName('action__38Xc')[0];
      elem.className = 'runcode-wrapper__8rXm';
      if (target.childNodes.length > 0) target.childNodes[0].prepend(elem);
    }
  }
};
/* Creates a ✔️ tick mark before "Run Code" button signaling CodeVault has done its job */
LeetCodeV1.prototype.markUploaded = function () {
  let elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;';
  }
};
/* Creates a ❌ failed tick mark before "Run Code" button signaling that upload failed */
LeetCodeV1.prototype.markUploadFailed = function () {
  let elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;';
  }
};

function LeetCodeV2() {
  this.submissionData;
  this.submissionId;
  this.difficulty;
  this.progressSpinnerElementId = 'codevault_progress_elem';
  this.progressSpinnerElementClass = 'codevault_progress';
  this.injectSpinnerStyle();
}
LeetCodeV2.prototype.init = async function () {
  const submissionId = this.submissionId;

  // Query for getting the solution runtime and memory stats, the code, the coding language, the question id, question title and question difficulty
  const submissionDetailsQuery = {
    query:
      '\n    query submissionDetails($submissionId: Int!) {\n  submissionDetails(submissionId: $submissionId) {\n    runtime\n    runtimeDisplay\n    runtimePercentile\n    runtimeDistribution\n    memory\n    memoryDisplay\n    memoryPercentile\n    memoryDistribution\n    code\n    timestamp\n    statusCode\n    lang {\n      name\n      verboseName\n    }\n    question {\n      questionId\n    title\n    titleSlug\n    content\n    difficulty\n  topicTags {\n    name\n    slug\n    }\n   }\n    notes\n    topicTags {\n      tagId\n      slug\n      name\n    }\n    runtimeError\n  }\n}\n    ',
    variables: { submissionId: submissionId },
    operationName: 'submissionDetails',
  };
  const submissionDetailsOptions = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: JSON.stringify(submissionDetailsQuery),
  };
  const submissionResponse = await fetch('https://leetcode.com/graphql/', submissionDetailsOptions);
  const submissionPayload = await submissionResponse.json().catch(() => ({}));
  const submissionData = submissionPayload?.data?.submissionDetails;
  if (!submissionResponse.ok || !submissionData?.question?.titleSlug) {
    const reason = submissionPayload?.errors?.[0]?.message || 'LeetCode did not return this submission.';
    throw new CodeVaultError(`Submission ${submissionId} could not be read: ${reason}`);
  }
    
  // Query for getting question details mainly frontendId
  // TODO: maybe handle a case where submissionData.question does not exist (e.g. LeetCode changes structure of response object)
  const questionDetailsQuery = {
    query: "\n    query questionDetail($titleSlug: String!) {\n  languageList {\n    id\n    name\n  }\n  submittableLanguageList {\n    id\n    name\n    verboseName\n  }\n  statusList {\n    id\n    name\n  }\n  questionDiscussionTopic(questionSlug: $titleSlug) {\n    id\n    commentCount\n    topLevelCommentCount\n  }\n  ugcArticleOfficialSolutionArticle(questionSlug: $titleSlug) {\n    uuid\n    chargeType\n    canSee\n    hasVideoArticle\n  }\n  question(titleSlug: $titleSlug) {\n    title\n    titleSlug\n    questionId\n    questionFrontendId\n    questionTitle\n    translatedTitle\n    content\n    translatedContent\n    categoryTitle\n    difficulty\n    stats\n    companyTagStatsV2\n    topicTags {\n      name\n      slug\n      translatedName\n    }\n    similarQuestionList {\n      difficulty\n      titleSlug\n      title\n      translatedTitle\n      isPaidOnly\n    }\n    mysqlSchemas\n    dataSchemas\n    frontendPreviews\n    likes\n    dislikes\n    isPaidOnly\n    status\n    canSeeQuestion\n    enableTestMode\n    metaData\n    enableRunCode\n    enableSubmit\n    enableDebugger\n    envInfo\n    isLiked\n    nextChallenges {\n      difficulty\n      title\n      titleSlug\n      questionFrontendId\n    }\n    libraryUrl\n    adminUrl\n    hints\n    codeSnippets {\n      code\n      lang\n      langSlug\n    }\n    exampleTestcaseList\n    hasFrontendPreview\n    featuredContests {\n      titleSlug\n      title\n    }\n  }\n}\n    ",
    variables: { titleSlug: submissionData.question.titleSlug },
    operationName: 'questionDetail',
  };
  const questionDetailsOptions = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: JSON.stringify(questionDetailsQuery),
  };
  const questionResponse = await fetch('https://leetcode.com/graphql/', questionDetailsOptions);
  const questionPayload = await questionResponse.json().catch(() => ({}));
  // The frontend ID is only used for the folder number. Keep importing with the
  // question ID when LeetCode temporarily declines this supplementary lookup.
  submissionData.question.questionFrontendId = questionPayload?.data?.question?.questionFrontendId || submissionData.question.questionId;

  this.submissionData = submissionData;
};
LeetCodeV2.prototype.findCode = function () {
  const code = this.getCode();
  if (!code) {
    throw new CodeVaultError('SolutionCodeNotFound');
  }

  return code;
};
LeetCodeV2.prototype.getCode = function () {
  if (this.submissionData != null) {
    return this.submissionData.code;
  }

  const code = document.getElementsByTagName('code');
  if (!checkElem(code)) {
    return null;
  }

  return code[0].innerText;
};
/** @returns {languages} */
LeetCodeV2.prototype.getLanguageExtension = function () {
  if (this.submissionData != null) {
    return languages[this.submissionData.lang.verboseName];
  }

  const tag = document.querySelector('button[id^="headlessui-listbox-button"]');
  if (!tag) {
    throw new CodeVaultError('LanguageButtonNotFound');
  }

  const lang = tag.innerText;
  if (languages[lang] === undefined) {
    throw new CodeVaultError(`UnknownLanguage::${lang}`);
  }

  return languages[lang];
};
LeetCodeV2.prototype.getNotesIfAny = function () {};
LeetCodeV2.prototype.getProblemNameSlug = function () {
  const slugTitle = this.submissionData.question.titleSlug;
  const qNum = this.submissionData.question.questionFrontendId;

  return addLeadingZeros(qNum + '-' + slugTitle);
};
LeetCodeV2.prototype.getSuccessStateAndUpdate = function () {
  const successTag = document.querySelectorAll('[data-e2e-locator="submission-result"]');
  if (checkElem(successTag)) {
    console.log('[CodeVault Sync]', successTag[0]);
    successTag[0].classList.add('marked_as_success');
    return true;
  }
  return false;
};
LeetCodeV2.prototype.parseStats = function () {
  if (this.submissionData != null) {
    const runtimePercentile =
      Math.round((this.submissionData.runtimePercentile + Number.EPSILON) * 100) / 100;
    const spacePercentile =
      Math.round((this.submissionData.memoryPercentile + Number.EPSILON) * 100) / 100;
    return formatStats(
      this.submissionData.runtimeDisplay,
      runtimePercentile,
      this.submissionData.memoryDisplay,
      spacePercentile
    );
  }

  const probStats = document.getElementsByClassName('flex w-full pb-4')[0].innerText.split('\n');
  if (!checkElem(probStats)) {
    return null;
  }

  const time = probStats[1];
  const timePercentile = probStats[3];
  const space = probStats[5];
  const spacePercentile = probStats[7];

  return formatStats(time, timePercentile, space, spacePercentile);
};
LeetCodeV2.prototype.parseQuestion = function () {
  let markdown;
  if (this.submissionData != null) {
    const questionUrl = window.location.href.split('/submissions')[0];
    const qTitle = `${this.submissionData.question.questionId}. ${this.submissionData.question.title}`;
    const qBody = this.parseQuestionDescription();

    this.difficulty = getDifficulty(this.submissionData.question.difficulty);

    // Final formatting of the contents of the README for each problem
    markdown = `<h2><a href="${questionUrl}">${qTitle}</a></h2><h3>${this.difficulty}</h3><hr>${qBody}`;
  } else {
    // TODO: get the README markdown via scraping. Right now this isn't possible.
    markdown = null;
  }

  return markdown;
};
LeetCodeV2.prototype.parseQuestionTitle = function () {
  if (this.submissionData != null) {
    return this.submissionData.question.title;
  }

  let questionTitle = document
    .getElementsByTagName('title')[0]
    .innerText.split(' ')
    .slice(0, -2)
    .join(' ');

  if (questionTitle === '') {
    questionTitle = 'unknown-problem';
  }

  return questionTitle;
};
LeetCodeV2.prototype.parseQuestionDescription = function () {
  if (this.submissionData != null) {
    return this.submissionData.question.content;
  }

  const description = document.getElementsByName('description');
  if (!checkElem(description)) {
    return null;
  }
  return description[0].content;
};
LeetCodeV2.prototype.parseDifficulty = function () {
  if (this.submissionData != null) {
    return getDifficulty(this.submissionData.question.difficulty);
  }

  const diffElement = document.getElementsByClassName('mt-3 flex space-x-4');
  if (checkElem(diffElement)) {
    return diffElement[0].children[0].innerText;
  }
  // Else, we're not on the description page. Nothing we can do.
  return 'unknown';
};
LeetCodeV2.prototype.startSpinner = function () {
  let elem = document.getElementById('codevault_progress_anchor_element');
  if (!elem) {
    elem = document.createElement('span');
    elem.id = 'codevault_progress_anchor_element';
    elem.style = 'margin-right: 20px;padding-top: 2px;';
  }
  elem.innerHTML = `<div id="${this.progressSpinnerElementId}" class="${this.progressSpinnerElementClass}"></div>`;
  this.insertToAnchorElement(elem);
};
LeetCodeV2.prototype.injectSpinnerStyle = function () {
  const style = document.createElement('style');
  style.textContent = `.${this.progressSpinnerElementClass} {pointer-events: none;width: 2.0em;height: 2.0em;border: 0.4em solid transparent;border-color: #eee;border-top-color: #3E67EC;border-radius: 50%;animation: loadingspin 1s linear infinite;} @keyframes loadingspin { 100% { transform: rotate(360deg) }}`;
  document.head.append(style);
};
LeetCodeV2.prototype.insertToAnchorElement = function (elem) {
  if (document.URL.startsWith('https://leetcode.com/explore/')) {
    // TODO: support spinner when answering problems on Explore pages
    //   action = document.getElementsByClassName('action');
    //   if (
    //     checkElem(action) &&
    //     checkElem(action[0].getElementsByClassName('row')) &&
    //     checkElem(action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6')) &&
    //     action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6').length > 1
    //   ) {
    //     target = action[0].getElementsByClassName('row')[0].getElementsByClassName('col-sm-6')[1];
    //     elem.className = 'pull-left';
    //     if (target.childNodes.length > 0) target.childNodes[0].prepend(elem);
    //   }
    return;
  }
  // TODO: target within the Run and Submit div regardless of UI position of submit button
  let target = document.querySelector('[data-e2e-locator="submission-result"]').parentElement;
  if (target) {
    elem.className = 'runcode-wrapper__8rXm';
    target.appendChild(elem);
  }
};
LeetCodeV2.prototype.markUploaded = function () {
  let elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid #78b13f;border-right:7px solid #78b13f;';
  }
};
LeetCodeV2.prototype.markUploadFailed = function () {
  let elem = document.getElementById(this.progressSpinnerElementId);
  if (elem) {
    elem.className = '';
    elem.style =
      'display: inline-block;transform: rotate(45deg);height:24px;width:12px;border-bottom:7px solid red;border-right:7px solid red;';
  }
};



;// ./scripts/leetcode/submitBtn.js


let api = getBrowser()

const getSubmissionPageBtns = () => {
  return document.querySelector('.flex.flex-none.gap-2:not(.justify-center):not(.justify-between)');
};

const createToolTip = () => {
  const toolTip = document.createElement('div');
  toolTip.id = 'codevault-upload-tooltip';
  toolTip.textContent =
    'Manually upload this submission to GitHub (beta).\nThis will OVERWRITE your current submission.\nPlease be mindful of your GitHub rate-limits.';
  toolTip.className =
    'fixed bg-sd-popover text-sd-popover-foreground rounded-sd-md z-modal text-xs text-left font-normal whitespace-pre-line shadow p-3 border-sd-border border cursor-default translate-y-20 transition-opacity opacity-0 transition-delay-1000 duration-300 group-hover:opacity-100';
  return toolTip;
};

const createGitIcon = () => {
  const uploadIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  uploadIcon.setAttribute('id', 'codevault-upload-icon');
  uploadIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  uploadIcon.setAttribute('width', '16');
  uploadIcon.setAttribute('height', '17');
  uploadIcon.setAttribute('viewBox', '0 0 38.999866 56.642887');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'style',
    'fill:#fcfcfc;fill-opacity:1;stroke:#ffffff;stroke-width:3;stroke-dasharray:none;stroke-opacity:1'
  );
  path.setAttribute(
    'd',
    'm 19.775372,2.121319 -9.072314,9.072314 a 0.51539412,0.66999737 45 0 0 -0.109554,0.838192 0.49679682,0.64582142 45 0 0 0.810286,-0.125057 l 7.846033,-7.846033 v 30.608468 a 0.47397466,0.47397466 0 0 0 0.473873,0.473873 h 0.0093 a 0.51713218,0.51713218 0 0 0 0.516765,-0.517281 V 4.018877 l 7.559745,7.560262 a 0.62190211,0.49679682 45 0 0 0.793233,0.107487 0.64518265,0.51539412 45 0 0 -0.09198,-0.820621 l -8.033101,-8.033102 0.0047,-0.0047 z m 7.81141,17.001029 v 0.999939 l 5.229655,0.01189 a 3.6922154,3.6922154 0 0 1 3.683496,3.692281 v 26.633 a 3.6835681,3.6835681 0 0 1 -3.683496,3.683496 H 6.1834371 a 3.6835681,3.6835681 0 0 1 -3.683496,-3.683496 v -26.633 a 3.6835681,3.6835681 0 0 1 3.683496,-3.683496 H 11.538666 V 19.143023 H 6.3121111 a 4.8119141,4.8119141 0 0 0 -4.812109,4.812109 v 26.375651 a 4.8119141,4.8119141 0 0 0 4.812109,4.81211 H 32.687762 a 4.8119141,4.8119141 0 0 0 4.81211,-4.81211 V 23.955128 a 4.8220648,4.8220648 0 0 0 -4.81211,-4.822444 z'
  );

  uploadIcon.appendChild(path);
  return uploadIcon;
};

function addManualSubmitBtn(eventHandler) {
  const btns = getSubmissionPageBtns();
  if (btns.innerText.includes('Solution') && !btns.innerText.includes('CodeVault')) {
    btns.appendChild(
      (() => {
        const btn = document.createElement('button');
        btn.innerText = 'Sync with CodeVault';
        btn.setAttribute('style', 'background-color:darkorange');
        btn.setAttribute(
          'class',
          'group whitespace-nowrap focus:outline-none text-label-r bg-green-s dark:bg-dark-blue-s hover:bg-green-3 dark:hover:bg-dark-blue-3 flex items-center justify-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium'
        );

        btn.prepend(createGitIcon());
        btn.appendChild(createToolTip());
        btn.addEventListener('click', eventHandler);
        return btn;
      })()
    );
  }
}

function setupManualSubmitBtn(submitBtnHandler) {
  // Detect when submissionPageBtns load.
  const submissionPageBtnsObserver = new MutationObserver((_, observer) => {
    const url = window.location.href;
    const btns = getSubmissionPageBtns();

    if (btns && btns.children.length < 3 && url.match(/\/submissions\//)) {
      observer.disconnect();
      addManualSubmitBtn(submitBtnHandler);
    }
  });

  // For continued SPA use, detect when LeetCode dynamic layout loads, set up click listener, then listen for btns. 
  const pageObserver = new MutationObserver((_, observer) => {
    // Display submission button on refresh trigger
    if (window.location.href.match(/leetcode\.com\/(.*)\/submissions\/(\d+)/)) {
      submissionPageBtnsObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
      return
    } 

    const dynamicLayout = document.querySelector('.flexlayout__layout');
    if (!dynamicLayout) {
      return;
    }
    
    observer.disconnect()

    dynamicLayout.addEventListener('click', async () => {
      const submissionId = await listenForSubmissionId();
      if (submissionId) {
        // listen for submission buttons
        submissionPageBtnsObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
    });
  });

  pageObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// Get SubmissionID by listening for URL changes to `/submissions/(d+)` format
async function listenForSubmissionId() {
  const { submissionId } = await api.runtime.sendMessage({
    type: 'LEETCODE_SUBMISSION',
  });
  if (submissionId == null) {
    return;
  }
  return submissionId;
}

/* harmony default export */ const submitBtn = (setupManualSubmitBtn);

;// ./scripts/leetcode/readmeTopics.js


const leetCodeSectionStart = `<!---LeetCode Topics Start-->`;
const leetCodeSectionHeader = `# LeetCode Topics`;
const leetCodeSectionEnd = `<!---LeetCode Topics End-->`;

function appendProblemToReadme(topic, markdownFile, hook, problem) {
  const url = `https://github.com/${hook}/tree/master/${problem}`;
  const topicHeader = `## ${topic}`;
  const topicTableHeader = `\n${topicHeader}\n|  |\n| ------- |\n`;
  const newRow = `| [${problem}](${url}) |`;

  // Check if the LeetCode Section exists, or add it
  let leetCodeSectionStartIndex = markdownFile.indexOf(leetCodeSectionStart);
  if (leetCodeSectionStartIndex === -1) {
    markdownFile +=
      '\n' + [leetCodeSectionStart, leetCodeSectionHeader, leetCodeSectionEnd].join('\n');
    leetCodeSectionStartIndex = markdownFile.indexOf(leetCodeSectionStart);
  }

  // Get LeetCode section and the Before & After sections
  const beforeSection = markdownFile.slice(0, markdownFile.indexOf(leetCodeSectionStart));
  const afterSection = markdownFile.slice(
    markdownFile.indexOf(leetCodeSectionEnd) + leetCodeSectionEnd.length,
  );

  let leetCodeSection = markdownFile.slice(
    markdownFile.indexOf(leetCodeSectionStart) + leetCodeSectionStart.length,
    markdownFile.indexOf(leetCodeSectionEnd),
  );

  // Check if topic table exists, or add it
  let topicTableIndex = leetCodeSection.indexOf(topicHeader);
  if (topicTableIndex === -1) {
    leetCodeSection += topicTableHeader;
    topicTableIndex = leetCodeSection.indexOf(topicHeader);
  }

  // Get the Topic table. If topic table was just added, then its end === LeetCode Section end
  const endTopicString = leetCodeSection.slice(topicTableIndex).match(/\|\n[^|]/)?.[0];
  const endTopicIndex = (endTopicString != null) ? leetCodeSection.indexOf(endTopicString, topicTableIndex + 1) : -1;
  let topicTable =
    endTopicIndex === -1
      ? leetCodeSection.slice(topicTableIndex)
      : leetCodeSection.slice(topicTableIndex, endTopicIndex + 1);
  topicTable = topicTable.trim();

  // Check if the problem exists in topic table, prevent duplicate add
  const problemIndex = topicTable.indexOf(problem);
  if (problemIndex !== -1) {
    return markdownFile;
  }

  // Append problem to the Topic
  topicTable = [topicTable, newRow, '\n'].join('\n');

  // Replace the old Topic table with the updated one in the markdown file
  leetCodeSection =
    leetCodeSection.slice(0, topicTableIndex) +
    topicTable +
    (endTopicIndex === -1 ? '' : leetCodeSection.slice(endTopicIndex + 1));

  markdownFile = [
    beforeSection,
    leetCodeSectionStart,
    leetCodeSection,
    leetCodeSectionEnd,
    afterSection,
  ].join('');

  return markdownFile;
}

// Sorts each Topic table by the problem number
function sortTopicsInReadme(markdownFile) {
  let beforeSection = markdownFile.slice(0, markdownFile.indexOf(leetCodeSectionStart));
  const afterSection = markdownFile.slice(
    markdownFile.indexOf(leetCodeSectionEnd) + leetCodeSectionEnd.length,
  );

  // Matches any text between the start and end tags. Should never fail to match.
  const leetCodeSection = markdownFile.match(
    new RegExp(`${leetCodeSectionStart}([\\s\\S]*)${leetCodeSectionEnd}`),
  )?.[1];
  if (leetCodeSection == null) throw new util_CodeVaultError('LeetCodeTopicSectionNotFound');
  

  // Remove the header
  let topics = leetCodeSection.trim().split('## ');
  topics.shift();

  // Get Array<sorted-topic>
  topics = topics.map(section => {
    let lines = section.trim().split('\n');

    // Get the problem topic
    const topic = lines.shift();

    // Check if topic exists elsewhere
    let topicHeaderIndex = markdownFile.indexOf(`## ${topic}`);
    let leetCodeSectionStartIndex = markdownFile.indexOf(leetCodeSectionStart);
    if (topicHeaderIndex < leetCodeSectionStartIndex) {
      // matches the next '|\n' that doesn't precede a '|'. Typically this is '|\n#. Should always match if topic existed elsewhere.
      const endTopicString = markdownFile.slice(topicHeaderIndex).match(/\|\n[^|]/)?.[0];
      if (endTopicString == null) throw new util_CodeVaultError('EndOfTopicNotFound');

      // Get the old problems for merge
      const endTopicIndex = markdownFile.indexOf(endTopicString, topicHeaderIndex + 1);
      const topicSection = markdownFile.slice(topicHeaderIndex, endTopicIndex + 1);
      const problemsToMerge = topicSection.trim().split('\n').slice(3);

      // Merge previously solved problems and removes duplicates
      lines = lines.concat(problemsToMerge).reduce((array, element) => {
        if (!array.includes(element)) {
          array.push(element);
        }
        return array;
      }, []);

      // Delete the old topic section after merging
      beforeSection =
        markdownFile.slice(0, topicHeaderIndex) +
        markdownFile.slice(endTopicIndex + 1, markdownFile.indexOf(leetCodeSectionStart));
    }

    // Remove the header and header separator
    lines = lines.slice(2);

    lines.sort((a, b) => {
      let numA = parseInt(a.match(/\/(\d+)-/)[1]);
      let numB = parseInt(b.match(/\/(\d+)-/)[1]);
      return numA - numB;
    });

    // Reconstruct the topic
    return ['## ' + topic].concat('|  |', '| ------- |', lines).join('\n');
  });

  // Reconstruct the file
  markdownFile =
    beforeSection +
    [leetCodeSectionStart, leetCodeSectionHeader, ...topics, leetCodeSectionEnd].join('\n') +
    afterSection;

  return markdownFile;
}



;// ./scripts/leetcode/leetcode.js





/* Commit messages */
const readmeMsg = 'docs: add challenge README';
const updateReadmeMsg = 'Update README - Topic Tags';
const updateStatsMsg = 'Updated stats';
const discussionMsg = 'docs: add discussion reference';
const createNotesMsg = 'docs: add solution notes';
const defaultRepoReadme = `<div align="center">

# 🧭 CodeVault

### A structured knowledge base for coding questions, solutions, and problem-solving patterns.

[![Repository](https://img.shields.io/badge/GitHub-CodeVault-181717?style=flat-square&logo=github)](https://github.com/sajeedkannoje/leetcode)
[![Practice](https://img.shields.io/badge/Practice-LeetCode-FFA116?style=flat-square&logo=leetcode&logoColor=white)](https://leetcode.com/)
[![Focus](https://img.shields.io/badge/Focus-DSA%20%26%20SQL-0F766E?style=flat-square)](#-topic-index)

**Solve with intent. Understand the pattern. Keep the lesson.**

</div>

---

## 🎯 About this repository

CodeVault is a version-controlled coding journal for LeetCode questions. Each solution keeps the code, the underlying idea, and useful review notes together.

## 🗂️ Topic index

Browse by concept. A question can appear in multiple topics because one challenge can teach several patterns.

${leetCodeSectionStart}
${leetCodeSectionHeader}
${leetCodeSectionEnd}

---

## 🧠 Problem-solving workflow

1. **Understand** — restate the question, constraints, and output.
2. **Recognize** — identify the pattern and why it fits.
3. **Solve** — write a clear solution before optimizing.
4. **Analyze** — record time and space complexity.
5. **Validate** — cover normal and edge cases.
6. **Review** — keep one takeaway for later revision.

## 🔄 LeetCode → CodeVault workflow

Choose a question → Solve and test → Save the solution → Sync to GitHub → Review the pattern

<div align="center">

**Build consistency, one question at a time.**

<sub>Made with ♥ by Sajeed Kannoje · CodeVault</sub>

</div>
`;
const readmeFilename = 'README.md';
const statsFilename = 'stats.json';
const dashboardFilename = 'codevault-dashboard.svg';
const createDashboardSvgLegacy = (stats = {}, theme = 'dashboard') => {
  const dark = theme !== 'showcase';
  const bg = dark ? '#07111f' : '#f8fafc';
  const ink = dark ? '#edf6ff' : '#10203a';
  const card = dark ? '#102033' : '#ffffff';
  const accent = theme === 'minimal' ? '#34d399' : '#22d3ee';
  const values = [['Solved', stats.solved || 0], ['Easy', stats.easy || 0], ['Medium', stats.medium || 0], ['Hard', stats.hard || 0]];
  const cards = values.map((item, index) => `<rect x="${40 + index * 185}" y="145" width="160" height="92" rx="13" fill="${card}" stroke="#334155"/><text x="${58 + index * 185}" y="177" fill="#94a3b8" font-size="15">${item[0]}</text><text x="${58 + index * 185}" y="215" fill="${accent}" font-size="30" font-weight="700">${item[1]}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="360" viewBox="0 0 820 360"><rect width="820" height="360" rx="22" fill="${bg}"/><circle cx="730" cy="45" r="95" fill="#312e8155"/><text x="40" y="65" fill="${accent}" font-size="20" font-family="Arial">&lt;/&gt; CODEVAULT SYNC</text><text x="40" y="110" fill="${ink}" font-size="32" font-weight="700" font-family="Arial">My Coding Vault</text><text x="40" y="135" fill="#94a3b8" font-size="15" font-family="Arial">Accepted challenges · synced to GitHub</text>${cards}<text x="40" y="285" fill="${ink}" font-size="18" font-weight="700" font-family="Arial">Progress Dashboard</text><text x="40" y="315" fill="#94a3b8" font-size="14" font-family="Arial">Generated automatically by CodeVault Sync</text></svg>`;
};
const createDashboardSvgBuiltIn = (stats = {}, theme = 'dashboard') => {
  const values = [['Solved', stats.solved || 0], ['Easy', stats.easy || 0], ['Medium', stats.medium || 0], ['Hard', stats.hard || 0]];
  const statCard = (item, x, y, fill, accent) => `<rect x="${x}" y="${y}" width="142" height="72" rx="10" fill="${fill}" stroke="${accent}55"/><text x="${x + 14}" y="${y + 25}" fill="#94a3b8" font-size="12">${item[0]}</text><text x="${x + 14}" y="${y + 55}" fill="${accent}" font-size="25" font-weight="700">${item[1]}</text>`;
  if (theme === 'showcase') {
    const cards = values.map((item, i) => statCard(item, 230 + (i % 2) * 160, 83 + Math.floor(i / 2) * 88, '#ffffff', ['#2563eb','#16a34a','#7c3aed','#ea580c'][i])).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="360" viewBox="0 0 820 360"><rect width="820" height="360" rx="20" fill="#f8fafc"/><rect x="0" width="190" height="360" rx="20" fill="#eff6ff"/><text x="30" y="52" fill="#2563eb" font-size="17" font-weight="700">&lt;/&gt; CODEVAULT</text><text x="30" y="92" fill="#1e3a5f" font-size="13">Overview</text><text x="30" y="128" fill="#64748b" font-size="13">Topics</text><text x="30" y="164" fill="#64748b" font-size="13">Recent solutions</text><text x="230" y="48" fill="#10203a" font-size="28" font-weight="700">My Coding Vault</text><text x="230" y="70" fill="#64748b" font-size="13">A clean showcase of accepted challenges</text>${cards}<text x="230" y="278" fill="#10203a" font-size="16" font-weight="700">Topic progress</text><rect x="230" y="294" width="510" height="9" rx="5" fill="#dbeafe"/><rect x="230" y="294" width="315" height="9" rx="5" fill="#2563eb"/><text x="230" y="330" fill="#64748b" font-size="12">Live stats updated by CodeVault Sync</text></svg>`;
  }
  if (theme === 'minimal') {
    const rows = values.map((item, i) => `<text x="45" y="${145 + i * 42}" fill="#bbf7d0" font-size="15">${item[0].toLowerCase().padEnd(9, ' ')} ${String(item[1]).padStart(4, ' ')}</text><rect x="250" y="${133 + i * 42}" width="230" height="11" fill="#153b2d"/><rect x="250" y="${133 + i * 42}" width="${Math.min(230, 24 + Number(item[1]) * 8)}" height="11" fill="${['#22d3ee','#34d399','#a78bfa','#fbbf24'][i]}"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="360" viewBox="0 0 820 360"><rect width="820" height="360" rx="18" fill="#06130f" stroke="#166534"/><text x="45" y="54" fill="#4ade80" font-size="19" font-family="monospace">&gt; codevault-sync</text><text x="45" y="86" fill="#bbf7d0" font-size="25" font-family="monospace" font-weight="700">MY CODING VAULT</text><rect x="45" y="105" width="730" height="1" fill="#166534"/>${rows}<text x="45" y="330" fill="#4ade80" font-size="13" font-family="monospace">status: synced · source: CodeVault Sync</text></svg>`;
  }
  const cards = values.map((item, i) => statCard(item, 38 + (i % 2) * 180, 130 + Math.floor(i / 2) * 85, '#111f31', ['#38bdf8','#34d399','#a78bfa','#fb923c'][i])).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="360" viewBox="0 0 820 360"><defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="#0b1727"/><stop offset="1" stop-color="#172554"/></linearGradient></defs><rect width="820" height="360" rx="20" fill="url(#sky)"/><circle cx="725" cy="46" r="28" fill="#fb923c"/><path d="M500 104l74-74 64 74 57-56 90 56v34H500z" fill="#0b1120" opacity=".7"/><text x="38" y="53" fill="#f59e0b" font-size="18" font-weight="700">&gt;</text><text x="66" y="53" fill="#f8fafc" font-size="22" font-weight="700">CodeVault Sync</text><text x="38" y="84" fill="#cbd5e1" font-size="14">A collection of accepted challenges, one commit at a time.</text><rect x="38" y="100" width="744" height="1" fill="#334155"/>${cards}<text x="430" y="152" fill="#f8fafc" font-size="16" font-weight="700">Topics</text><text x="430" y="180" fill="#38bdf8" font-size="13">Array</text><rect x="505" y="171" width="190" height="7" rx="4" fill="#1e3a5f"/><rect x="505" y="171" width="120" height="7" rx="4" fill="#38bdf8"/><text x="430" y="218" fill="#34d399" font-size="13">Hash Map</text><rect x="505" y="209" width="190" height="7" rx="4" fill="#164e63"/><rect x="505" y="209" width="94" height="7" rx="4" fill="#34d399"/><text x="430" y="256" fill="#a78bfa" font-size="13">Binary Search</text><rect x="505" y="247" width="190" height="7" rx="4" fill="#312e81"/><rect x="505" y="247" width="142" height="7" rx="4" fill="#a78bfa"/><text x="38" y="330" fill="#94a3b8" font-size="12">Live dashboard generated by CodeVault Sync</text></svg>`;
};

const createDashboardSvg = async (stats = {}, theme = 'dashboard') => {
  const themes = { dashboard: 'modern-dark.svg', showcase: 'clean-light.svg', developer: 'developer.svg', glass: 'glass.svg', sidebar: 'sidebar.svg', minimal: 'terminal.svg' };
  const templateUrl = leetcode_api.runtime.getURL(`assets/readme-themes/${themes[theme] || themes.dashboard}`);
  let svg = await fetch(templateUrl).then(response => {
    if (!response.ok) throw new Error('Could not load the selected README theme.');
    return response.text();
  }).catch(() => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="420"><rect width="1200" height="420" rx="24" fill="#0b1727"/><text x="55" y="80" fill="#38bdf8" font-size="24">CodeVault Sync</text><text x="55" y="140" fill="#f8fafc" font-size="40" font-weight="700">My Coding Vault</text><text x="55" y="195" fill="#cbd5e1" font-size="20">Solved: ${stats.solved || 0} · Easy: ${stats.easy || 0} · Medium: ${stats.medium || 0} · Hard: ${stats.hard || 0}</text></svg>`);
  const solved = String(stats.solved || 0);
  svg = svg.replace(/>leetcode</gi, '>CodeVault Sync<')
    .replace(/>124</g, `>${solved}<`)
    .replace(/>98</g, `>${solved}<`)
    .replace(/>78\.3%</g, '>Live<')
    .replace(/>12 days</g, '>Synced<')
    .replace(/32\/40 solved|18\/25 solved|14\/20 solved|10\/15 solved|12\/20 solved|8\/12 solved|14\/25 solved|6\/18 solved/g, 'Live progress')
    .replace(/Updated automatically by CodeVault Sync/g, `Updated · ${solved} solved · CodeVault Sync`);
  return svg;
};

const dashboardRepoReadme = `# My Coding Vault

<div align="center">

![CodeVault Sync](https://img.shields.io/badge/CodeVault-Sync-4F46E5?style=for-the-badge)
![LeetCode](https://img.shields.io/badge/LeetCode-Practice-FFA116?style=for-the-badge&logo=leetcode&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Portfolio-181717?style=for-the-badge&logo=github)

### My personal archive of accepted coding challenges

</div>

![CodeVault Sync dashboard](./codevault-dashboard.svg)

## Progress

> Solutions are organised by topic below as I solve them. Local progress is maintained in \`stats.json\`.

| Platform | What is saved |
| :--- | :--- |
| LeetCode | Accepted solutions, performance, notes, tags, and question pages |
| GitHub | Clean commit history and a browsable coding portfolio |

<!-- CodeVault Sync maintains the topic index below this line. -->
`;
const showcaseRepoReadme = `# My Coding Vault

> A growing portfolio of accepted algorithms and data-structure challenges.

## Highlights

- Organised by problem and topic
- Detailed question readmes and solutions
- Progress automatically maintained by CodeVault Sync

<!-- CodeVault Sync maintains the topic index below this line. -->
`;
const formatQuestionReadmeLegacy = (statement, theme, details = {}) => {
  const tags = details.tags?.slice(0, 5).map(tag => `\`${tag.name}\``).join(' ') || '—';
  const language = details.language || '—';
  const submittedAt = details.submittedAt || '—';
  const metrics = `| Status | ✅ Accepted |\n| :--- | :--- |\n| Submitted | ${submittedAt} |\n| Language | ${language} |\n| Runtime | ${details.runtime || '—'} |\n| Memory | ${details.memory || '—'} |\n| Runtime percentile | ${details.runtimePercentile || '—'} |\n| Memory percentile | ${details.memoryPercentile || '—'} |`;
  const source = details.code ? `\n## Code\n\n\`\`\`${details.codeLanguage || ''}\n${details.code}\n\`\`\`\n` : '';
  const notes = `\n## Notes\n\n> Add your approach, edge cases, and complexity notes here.\n\n## Related tags\n\n${tags}\n`;
  if (theme === 'focus') return `# 🎯 Solution Record\n\n${metrics}\n\n---\n\n${statement}${source}${notes}`;
  if (theme === 'vault') return `<div align="center">\n\n# 🔐 CodeVault Challenge Record\n\n![Accepted](https://img.shields.io/badge/Status-Accepted-16A34A?style=flat-square)\n![Language](https://img.shields.io/badge/Language-${encodeURIComponent(language)}-4F46E5?style=flat-square)\n\n*Saved with CodeVault Sync*\n\n</div>\n\n## Submission\n\n${metrics}\n\n---\n\n## Problem\n\n${statement}${source}${notes}`;
  return `# Solution\n\n${metrics}\n\n---\n\n## Problem\n\n${statement}${source}${notes}`;
};

const formatQuestionReadme = (statement, _theme, details = {}) => {
  const tags = details.tags || [];
  const tagList = tags.slice(0, 8).map(tag => `\`${tag.name}\``).join(' ') || '—';
  const primaryTopic = tags[0]?.name || 'Problem Solving';
  const problemNumber = statement.match(/>(\d+)\.\s/)?.[1] || 'Problem';
  const problemUrl = statement.match(/href="([^"]+)"/)?.[1] || 'https://leetcode.com/';
  const difficulty = statement.match(/<h3>([^<]+)<\/h3>/)?.[1] || 'Solved';
  const fence = '```';
  const source = details.code ? `${fence}${details.codeLanguage || ''}\n${details.code}\n${fence}` : 'No code was captured for this submission.';
  return `<div align="center">\n\n# 🧩 ${problemNumber} · ${details.title || 'Accepted Solution'}\n\n### A clear solution, a reusable pattern, and a lesson worth remembering.\n\n[![LeetCode](https://img.shields.io/badge/LeetCode-Problem-FFA116?style=flat-square&logo=leetcode&logoColor=white)](${problemUrl})\n[![Topic](https://img.shields.io/badge/Topic-${encodeURIComponent(primaryTopic).replace(/%20/g, '%20')}-0F766E?style=flat-square)](#-pattern-recognition)\n[![Language](https://img.shields.io/badge/Language-${encodeURIComponent(details.language || 'Code')}-2563EB?style=flat-square)](#-solution)\n\n**Difficulty:** ${difficulty} · **Status:** Solved\n\n</div>\n\n---\n\n## 🎯 Problem summary\n\n${statement}\n\n---\n\n## 📌 Submission record\n\n| Detail | Result |\n|---|---|\n| Status | ✅ Accepted |\n| Submitted | ${details.submittedAt || '—'} |\n| Language | ${details.language || '—'} |\n| Runtime | ${details.runtime || '—'}${details.runtimePercentile ? ` · Beats ${details.runtimePercentile}` : ''} |\n| Memory | ${details.memory || '—'}${details.memoryPercentile ? ` · Beats ${details.memoryPercentile}` : ''} |\n\n## 🧭 Pattern recognition\n\n**Primary topic:** ${primaryTopic}\n\n**Related topics:** ${tagList}\n\n> Add the clue that made this pattern recognizable and one sentence explaining why the approach works.\n\n---\n\n## 💡 Intuition\n\n1. **Observation:** Add the key property of this problem.\n2. **Approach:** Explain how the submitted solution uses it.\n3. **Why it works:** Record the invariant or correctness idea.\n\n**Memory hook:** > Add a short phrase to recall this technique later.\n\n---\n\n## 💻 Solution\n\n### Accepted implementation\n\n${source}\n\n## ⏱️ Complexity analysis\n\n| Time complexity | Auxiliary space |\n|---|---|\n| Add after reviewing the submitted code | Add after reviewing the submitted code |\n\n## 🧯 Edge cases & validation\n\n- [ ] Minimum valid input\n- [ ] Boundary values or duplicate values\n- [ ] No-match / empty case, when allowed\n- [ ] A typical example\n\n## 🔁 Revision notes\n\n<details open>\n<summary><strong>30-second recap</strong></summary>\n\n- **Pattern:** ${primaryTopic}\n- **Core idea:** Add one sentence after review.\n- **Complexity:** Add the actual complexity.\n- **Memory hook:** Add a phrase that makes the solution easy to recall.\n\n</details>\n\n---\n\n<div align="center">\n\n**One problem. One pattern. One lesson retained.**\n\n[← Back to CodeVault](https://github.com/sajeedkannoje/leetcode)\n\n<sub>Maintained by Sajeed Kannoje · CodeVault</sub>\n\n</div>\n`;
};

const formatQuestionReadmeFull = (statement, _theme, details = {}) => {
  const tags = details.tags || [];
  const primary = tags[0]?.name || 'Problem Solving';
  const tagList = tags.slice(0, 8).map(tag => `\`${tag.name}\``).join(' ') || '—';
  const number = statement.match(/>(\d+)\.\s/)?.[1] || 'Problem';
  const url = statement.match(/href="([^"]+)"/)?.[1] || 'https://leetcode.com/';
  const difficulty = statement.match(/<h3>([^<]+)<\/h3>/)?.[1] || 'Solved';
  const fence = '```';
  return `<div align="center">\n\n# 🧩 ${number} · ${details.title || 'Accepted Solution'}\n\n### A clear solution, a reusable pattern, and a lesson worth remembering.\n\n[![LeetCode](https://img.shields.io/badge/LeetCode-Problem-FFA116?style=flat-square&logo=leetcode&logoColor=white)](${url}) [![Topic](https://img.shields.io/badge/Topic-${encodeURIComponent(primary)}-0F766E?style=flat-square)](#-pattern-recognition) [![Language](https://img.shields.io/badge/Language-${encodeURIComponent(details.language || 'Code')}-2563EB?style=flat-square)](#-solution)\n\n**Difficulty:** ${difficulty} · **Status:** Solved\n\n</div>\n\n---\n\n## 🎯 Problem summary\n\n${statement}\n\n### Given, return & examples\n\nUse the original problem statement above as the source of truth. Add a representative example and the key constraints when reviewing this question.\n\n## 📌 Constraints\n\n- Add the constraints that influence the approach.\n- Record any sortedness, uniqueness, or range guarantees.\n- Explain what they tell you about a practical solution.\n\n---\n\n## 🧭 Pattern recognition\n\n### Primary pattern: **${primary}**\n\n**Related topics:** ${tagList}\n\n- Add the clue in the question that suggests this pattern.\n- Add why this approach fits better than alternatives.\n\n## 💡 Intuition\n\n1. **Observation:** Add the key property.\n2. **Key idea:** Explain what the algorithm does with it.\n3. **Why it works:** Record the invariant or correctness argument.\n4. **Stopping condition:** Record when it can safely return.\n\n**Memory hook:** > Add a short phrase to recall this technique.\n\n---\n\n## 🪜 Approach\n\n### Approach A — Brute force\n\nAdd a simple baseline only when it helps explain the optimized solution.\n\n### Approach B — Accepted solution\n\nDescribe the repeated work or extra storage avoided by the submitted solution.\n\n## 🧪 Dry run\n\n| Step | Current state | Decision / action | Result |\n|---:|---|---|---|\n| 1 | Add a small example | Track relevant variables | Add outcome |\n\n---\n\n## 💻 Solution\n\n### 🏆 Submission performance\n\n| Metric | Details |\n|---|---|\n| Status | ✅ Accepted |\n| Submitted | ${details.submittedAt || '—'} |\n| Language | ${details.language || '—'} |\n| Runtime | ${details.runtime || '—'}${details.runtimePercentile ? ` · Beats ${details.runtimePercentile}` : ''} |\n| Memory | ${details.memory || '—'}${details.memoryPercentile ? ` · Beats ${details.memoryPercentile}` : ''} |\n| Runtime percentile | ${details.runtimePercentile || '—'} |\n| Memory percentile | ${details.memoryPercentile || '—'} |\n\n> Performance values come from this accepted submission and can vary between runs.\n\n### Recommended solution\n\n${details.code ? `${fence}${details.codeLanguage || ''}\n${details.code}\n${fence}` : 'No code was captured for this submission.'}\n\n### Code walkthrough\n\n| Code section | Purpose |\n|---|---|\n| Key variable / loop | Add why it is needed |\n| Core operation | Add what it guarantees |\n| Return condition | Add why the answer is correct |\n\n---\n\n## ⏱️ Complexity analysis\n\n| Approach | Time complexity | Auxiliary space | Reason |\n|---|---|---|---|\n| Accepted solution | Add after review | Add after review | Base this on the submitted code |\n\n## 🧯 Edge cases & validation\n\n| Case | Expected behavior |\n|---|---|\n| Minimum valid input | Add result |\n| Boundary or duplicate values | Add result |\n| No-match / empty case, if allowed | Add result |\n\n## ⚠️ Common mistakes\n\n- Add the most likely off-by-one, duplicate-handling, or pointer-movement error.\n- Add one high-value check before submitting.\n\n## 🔁 Revision notes\n\n<details open>\n<summary><strong>30-second recap</strong></summary>\n\n- **Pattern:** ${primary}\n- **Core idea:** Add one sentence after review.\n- **Critical invariant:** Add what must remain true.\n- **Complexity:** Add actual complexity.\n- **Memory hook:** Add a recall phrase.\n\n</details>\n\n### Active recall\n\n1. What clue suggests this pattern?\n2. Why is the algorithm correct?\n3. What are its time and auxiliary-space costs?\n4. Which edge case is easiest to mishandle?\n\n## 🔗 Related practice\n\nAdd only problems that genuinely reinforce the same pattern.\n\n---\n\n<div align="center">\n\n**One problem. One pattern. One lesson retained.**\n\n[← Back to CodeVault](https://github.com/sajeedkannoje/leetcode)\n\n<sub>Maintained by Sajeed Kannoje · CodeVault</sub>\n\n</div>\n`;
};

const formatQuestionReadmeFinal = (...args) => formatQuestionReadmeFull(...args)
  .replace('### Recommended solution', '### My solution')
  .replace('<sub>Maintained by Sajeed Kannoje · CodeVault</sub>', '<sub>Made with ♥ by Sajeed Kannoje · CodeVault</sub>');

// problem types
const NORMAL_PROBLEM = 0;
const EXPLORE_SECTION_PROBLEM = 1;

const WAIT_FOR_GITHUB_API_TO_NOT_THROW_409_MS = 500;

const leetcode_api = getBrowser();

/**
 * Constructs a file path by appending the given filename to the problem directory.
 * If no filename is provided, it returns the problem name as the path.
 *
 * @param {string} problem - The base problem directory or the entire file path if no filename is provided.
 * @param {string} [filename] - Optional parameter for the filename to be appended to the problem directory.
 * @returns {string} - Returns a string representing the complete file path, either with or without the appended filename.
 */
const getPath = (problem, filename) => {
  return filename ? `${problem}/${filename}` : problem;
};

// https://web.archive.org/web/20190623091645/https://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
// In order to preserve mutation of the data, we have to encode it, which is usually done in base64.
// But btoa only accepts ASCII 7 bit chars (0-127) while Javascript uses 16-bit minimum chars (0-65535).
// EncodeURIComponent converts the Unicode Points UTF-8 bits to hex UTF-8.
// Unescape converts percent-encoded hex values into regular ASCII (optional; it shrinks string size).
// btoa converts ASCII to base64.
/** Decodes a base64 encoded string into UTF-8 format using URI encoding.*/
const decode = data => decodeURIComponent(escape(atob(data)));
/** Encodes a given string into base64 format.*/
const encode = data => btoa(unescape(encodeURIComponent(data)));

/**
 * Uploads content to a specified GitHub repository and updates local stats with the sha of the updated file.
 * @async
 * @param {string} token - The authentication token used to authorize the request.
 * @param {string} hook - The owner and repository name in the format 'owner/repo'.
 * @param {string} content - The content to be uploaded, typically a string encoded in base64.
 * @param {string} problem - The problem slug, which is a combination of problem ID and name, and acts as a folder.
 * @param {string} filename - The name of the file, typically the problem slug + file extension.
 * @param {string} sha - The SHA of the existing file.
 * @param {string} message - A commit message describing the change.
 * @param {string} [difficulty] - The difficulty level of the problem.
 *
 * @returns {Promise<string>} - A promise that resolves with the new SHA of the content after successful upload.
 *
 * @throws {CodeVaultError} - Throws an error if the response is not OK (e.g., HTTP status code is not `200-299`).
 */
const recordSyncEvent = async event => {
  const { sync_history = [] } = await leetcode_api.storage.local.get('sync_history');
  const history = [event, ...sync_history].slice(0, 25);
  await leetcode_api.storage.local.set({ sync_history: history, sync_status: event });
};

const clearTransientStatsConflicts = async () => {
  const { sync_history = [] } = await leetcode_api.storage.local.get('sync_history');
  const history = sync_history.filter(event => !(event.path === statsFilename && event.state === 'failed' && event.message?.includes('(409)')));
  await leetcode_api.storage.local.set({ sync_history: history });
};

const upload = async (token, hook, content, problem, filename, sha, message) => {
  const path = getPath(problem, filename);
  const URL = `https://api.github.com/repos/${hook}/contents/${path}`;
  const { default_branch = 'main', commit_style = 'clear' } = await leetcode_api.storage.local.get([
    'default_branch',
    'commit_style',
  ]);
  const commitMessage = commit_style === 'clear' && filename && filename !== 'README.md'
    ? `feat: sync ${problem.replace(/^\d+-/, '').replaceAll('-', ' ')} solution`
    : message;

  let data = {
    message: commitMessage,
    content,
    sha,
    branch: default_branch,
  };

  let options = {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(data),
  };

  const res = await fetch(URL, options);
  if (!res.ok) {
    await recordSyncEvent({ state: 'failed', message: `Sync failed for ${path} (${res.status})`, path, at: Date.now() });
    throw new util_CodeVaultError(res.status, { cause: res });
  }
  await recordSyncEvent({ state: 'synced', message: `Synced ${path}`, path, at: Date.now() });
  console.log('[CodeVault Sync]', `Successfully committed ${getPath(problem, filename)} to github`);

  const body = await res.json();
  //TODO: Think, should we be setting stats state here?
  const stats = await getAndInitializeStats(problem);
  stats.shas[problem][filename] = body.content.sha;
  leetcode_api.storage.local.set({ stats });

  return body.content.sha;
};

// Returns stats object. If it didn't exist, initializes stats with default difficulty values and initializes the sha object for problem
const getAndInitializeStats = problem => {
  return leetcode_api.storage.local.get('stats').then(({ stats }) => {
    if (stats == null || isEmptyObject(stats)) {
      stats = {};
      stats.shas = {};
      stats.solved = 0;
      stats.easy = 0;
      stats.medium = 0;
      stats.hard = 0;
    }

    if (stats.shas[problem] == null) {
      stats.shas[problem] = {};
    }

    return stats;
  });
};

/**
 * Increment the statistics for a given problem based on its difficulty.
 * @param {DIFFICULTY} difficulty - The difficulty level of the problem, which can be `easy`, `medium`, or `hard`.
 * @param {string} problem - The slug problem name, e.g. `0001-two-sum`
 * @returns {Promise<Object>} A promise that resolves to the updated statistics object.
 */
const incrementStats = (difficulty, problem) => {
  const diff = getDifficulty(difficulty);
  return leetcode_api.storage.local.get('stats').then(({ stats }) => {
    stats.solved += 1;
    stats.easy += diff === DIFFICULTY.EASY ? 1 : 0;
    stats.medium += diff === DIFFICULTY.MEDIUM ? 1 : 0;
    stats.hard += diff === DIFFICULTY.HARD ? 1 : 0;
    stats.shas[problem].difficulty = diff.toLowerCase();
    leetcode_api.storage.local.set({ stats });
    return stats;
  });
};

/**
 * Sets persistent stats and merges any cloud updates into local stats
 * @async
 * @param {Object} localStats - Local statistics about LeetCode problems.
 * @returns {Promise<void>} A promise that resolves to the sha of the newly updated `stats.json` file.
 *
 * @throws {Error} - If the upload operation fails for any reason other than 409 Conflict
 */
const setPersistentStats = async localStats => {
  let pStats = { leetcode: localStats };
  const pStatsEncoded = encode(JSON.stringify(pStats));
  const sha = localStats?.shas?.[statsFilename]?.[''] || '';

  const { codevault_token: token, codevault_hook: hook } = await leetcode_api.storage.local.get([
    'codevault_token',
    'codevault_hook',
  ]);

  try {
    const statsSha = await upload(token, hook, pStatsEncoded, statsFilename, '', sha, updateStatsMsg);
    return statsSha;
  } catch (e) {
    if (e.message === '409') {
      // Stats were updated on GitHub since last submission
      const { content, sha } = await getGitHubFile(token, hook, statsFilename).then(res =>
        res.json()
      );
      pStats = JSON.parse(decode(content));
      const mergedStats = mergeStats(pStats.leetcode, localStats);
      const mergedStatsEncoded = encode(JSON.stringify({ leetcode: mergedStats }));

      // Update local stats with the changes from GitHub
      await leetcode_api.storage.local.set({ stats: mergedStats });

      const statsSha = await delay(
        () => upload(token, hook, mergedStatsEncoded, statsFilename, '', sha, updateStatsMsg),
        WAIT_FOR_GITHUB_API_TO_NOT_THROW_409_MS
      );
      await clearTransientStatsConflicts();
      return statsSha;
    }
    throw e;
  }
};

const isCompleted = problemName => {
  return leetcode_api.storage.local.get('stats').then(data => {
    if (data?.stats?.shas?.[problemName] == null) return false;

    for (let file of Object.keys(data?.stats?.shas?.[problemName])) {
      if (file.includes(problemName)) return true;
    }

    return false;
  });
};

/* Discussion posts prepended at top of README */
/* Future implementations may require appending to bottom of file */
const updateReadmeWithDiscussionPost = async (
  addition,
  directory,
  filename,
  commitMsg,
  shouldPreprendDiscussionPosts
) => {
  let responseSHA;
  const { codevault_token, codevault_hook } = await leetcode_api.storage.local.get([
    'codevault_token',
    'codevault_hook',
  ]);

  return getGitHubFile(codevault_token, codevault_hook, directory, filename)
    .then(resp => resp.json())
    .then(data => {
      responseSHA = data.sha;
      return decode(data.content);
    })
    .then(existingContent =>
      shouldPreprendDiscussionPosts ? encode(addition + existingContent) : encode(existingContent)
    )
    .then(newContent =>
      upload(codevault_token, codevault_hook, newContent, directory, filename, responseSHA, commitMsg)
    );
};

/**
 * Wrapper func to upload code to a specific GitHub repository and handle 409 errors (conflict)
 * @async
 * @function uploadGitWith409Retry
 * @param {string} code - The code content that needs to be uploaded.
 * @param {string} problemName - The name of the problem or file where the code is related to.
 * @param {string} filename - The target filename in the repository where the code will be stored.
 * @param {string} commitMsg - The commit message that describes the changes being made.
 * @param {Object} [optionals] - Optional parameters for updating stats
 * @param {string} optionals.sha - The SHA value of the existing content to be updated (optional).
 * @param {DIFFICULTY} optionals.difficulty - The difficulty level of the problem (optional).
 *
 * @returns {Promise<string>} A promise that resolves with the new SHA of the content after successful upload.
 *
 * @throws {CodeVaultError} If there's no token defined, the mode type is not `commit`, or if no repository hook is defined.
 */
async function uploadGitWith409Retry(code, problemName, filename, commitMsg, optionals) {
  let token;
  let hook;

  const storageData = await leetcode_api.storage.local.get([
    'codevault_token',
    'mode_type',
    'codevault_hook',
    'stats',
  ]);

  token = storageData.codevault_token;
  if (!token) {
    throw new util_CodeVaultError('CodevaultTokenUndefined');
  }

  if (storageData.mode_type !== 'commit') {
    throw new util_CodeVaultError('CodeVaultNotAuthorizedByGit');
  }

  hook = storageData.codevault_hook;
  if (!hook) {
    throw new util_CodeVaultError('NoRepoDefined');
  }

  /* Get SHA, if it exists */
  const sha = optionals?.sha
    ? optionals.sha
    : storageData.stats?.shas?.[problemName]?.[filename] !== undefined
    ? storageData.stats.shas[problemName][filename]
    : '';

  try {
    return await upload(
      token,
      hook,
      code,
      problemName,
      filename,
      sha,
      commitMsg,
      optionals?.difficulty
    );
  } catch (err) {
    if (err.message === '409') {
      const data = await getGitHubFile(token, hook, problemName, filename).then(res => res.json());
      return upload(
        token,
        hook,
        code,
        problemName,
        filename,
        data.sha,
        commitMsg,
        optionals?.difficulty
      );
    }
    throw err;
  }
}

/** Returns GitHub data for the file specified by `${directory}/${filename}` path
 * @async
 * @function getGitHubFile
 * @param {string} token - The personal access token for authentication with GitHub.
 * @param {string} hook - The owner and repository name in the format "owner/repository".
 * @param {string} directory - The directory within the repository where the file is located.
 * @param {string} filename - The name of the file to be fetched.
 * @returns {Promise<Response>} A promise that resolves with the response from the GitHub API request.
 * @throws {Error} Throws an error if the response is not OK (e.g., HTTP status code is not 200-299).
 */
async function getGitHubFile(token, hook, directory, filename) {
  const path = getPath(directory, filename);
  const URL = `https://api.github.com/repos/${hook}/contents/${path}`;

  let options = {
    method: 'GET',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  };

  const res = await fetch(URL, options);
  if (!res.ok) {
    throw new Error(res.status);
  }

  return res;
}

/* Discussion Link - When a user makes a new post, the link is prepended to the README for that problem.*/
document.addEventListener('click', event => {
  const element = event.target;
  const oldPath = window.location.pathname;

  /* Act on Post button click */
  /* Complex since "New" button shares many of the same properties as "Post button */
  if (
    element &&
    (element.classList.contains('icon__3Su4') ||
      element.parentElement?.classList.contains('icon__3Su4') ||
      element.parentElement?.classList.contains('btn-content-container__214G') ||
      element.parentElement?.classList.contains('header-right__2UzF'))
  ) {
    setTimeout(function () {
      /* Only post if post button was clicked and url changed */
      if (
        oldPath !== window.location.pathname &&
        oldPath === window.location.pathname.substring(0, oldPath.length) &&
        !Number.isNaN(window.location.pathname.charAt(oldPath.length))
      ) {
        const date = new Date();
        const currentDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}`;
        const addition = `[Discussion Post (created on ${currentDate})](${window.location})  \n`;
        const problemName = window.location.pathname.split('/')[2]; // must be true.
        updateReadmeWithDiscussionPost(addition, problemName, readmeFilename, discussionMsg, true);
      }
    }, 1000);
  }
});

async function createRepoReadme() {
  const content = encode(defaultRepoReadme);
  return uploadGitWith409Retry(content, readmeFilename, '', readmeMsg);
}

async function updateReadmeTopicTagsWithProblem(topicTags, problemName) {
  if (topicTags == null) {
    console.log('[CodeVault Sync]', new util_CodeVaultError('TopicTagsNotFound'));
    return;
  }

  const { codevault_token, codevault_hook, stats } = await leetcode_api.storage.local.get([
    'codevault_token',
    'codevault_hook',
    'stats',
  ]);

  let readme;
  let newSha;

  try {
    const { content, sha } = await getGitHubFile(
      codevault_token,
      codevault_hook,
      readmeFilename
    ).then(resp => resp.json());
    readme = content;
    stats.shas[readmeFilename] = { '': sha };
    await leetcode_api.storage.local.set({ stats });
  } catch (err) {
    if (err.message === '404') {
      newSha = await createRepoReadme();
    }
    throw err;
  }
  readme = decode(readme);
  for (let topic of topicTags) {
    readme = appendProblemToReadme(topic.name, readme, codevault_hook, problemName);
  }
  readme = sortTopicsInReadme(readme);
  readme = encode(readme);

  return delay(
    () => uploadGitWith409Retry(readme, readmeFilename, '', updateReadmeMsg, { sha: newSha }),
    WAIT_FOR_GITHUB_API_TO_NOT_THROW_409_MS
  );
}

/** @param {LeetCodeV1 | LeetCodeV2} leetCode */
function loader(leetCode) {
  let iterations = 0;
  const intervalId = setInterval(async () => {
    try {
      const isSuccessfulSubmission = leetCode.getSuccessStateAndUpdate();
      if (!isSuccessfulSubmission) {
        iterations++;
        if (iterations > 9) {
          // poll for max 10 attempts (10 seconds)
          throw new util_CodeVaultError('Could not find successful submission after 10 seconds.');
        }
        return;
      }
      leetCode.startSpinner();

      // If successful, stop polling
      clearInterval(intervalId);

      // For v2, query LeetCode API for submission results
      await leetCode.init();

      const probStats = leetCode.parseStats();
      if (!probStats) {
        throw new util_CodeVaultError('SubmissionStatsNotFound');
      }

      const probStatement = leetCode.parseQuestion();
      if (!probStatement) {
        throw new util_CodeVaultError('ProblemStatementNotFound');
      }

      const problemName = leetCode.getProblemNameSlug();
      const alreadyCompleted = await isCompleted(problemName);
      const language = leetCode.getLanguageExtension();
      if (!language) {
        throw new util_CodeVaultError('LanguageNotFound');
      }
      const filename = problemName + language;
      const code = leetCode.findCode(probStats);
      const submission = leetCode.submissionData;
      const submittedAt = submission?.timestamp
        ? new Date(Number(submission.timestamp) * 1000).toLocaleString()
        : new Date().toLocaleString();
      const questionReadmeDetails = {
        title: submission?.title || leetCode.parseQuestionTitle(),
        code,
        codeLanguage: submission?.lang?.name || '',
        language: submission?.lang?.verboseName || language.replace('.', ''),
        submittedAt,
        runtime: submission?.runtimeDisplay,
        memory: submission?.memoryDisplay,
        runtimePercentile: submission?.runtimePercentile != null ? `${Number(submission.runtimePercentile).toFixed(2)}%` : '',
        memoryPercentile: submission?.memoryPercentile != null ? `${Number(submission.memoryPercentile).toFixed(2)}%` : '',
        tags: submission?.question?.topicTags,
      };

      /* Upload README */
      const { question_readme_theme = 'classic' } = await leetcode_api.storage.local.get('question_readme_theme');
      const themedProblemStatement = formatQuestionReadmeFinal(probStatement, question_readme_theme, questionReadmeDetails);
      const uploadReadMe = await leetcode_api.storage.local.get('stats').then(({ stats }) => {
        const shaExists = stats?.shas?.[problemName]?.[readmeFilename] !== undefined;

        if (!shaExists) {
          return uploadGitWith409Retry(
            encode(themedProblemStatement),
            problemName,
            readmeFilename,
            readmeMsg
          );
        }
      });

      /* Upload Notes if any*/
      const notes = leetCode.getNotesIfAny();
      let uploadNotes;
      const { upload_notes = true } = await leetcode_api.storage.local.get('upload_notes');
      if (upload_notes && notes != undefined && notes.length > 0) {
        uploadNotes = uploadGitWith409Retry(encode(notes), problemName, 'NOTES.md', createNotesMsg);
      }

      /* Upload code to Git */
      const uploadCode = uploadGitWith409Retry(encode(code), problemName, filename, probStats);

      /* Group problem into its relevant topics */
      const updateRepoReadMe = updateReadmeTopicTagsWithProblem(
        leetCode.submissionData?.question?.topicTags,
        problemName
      );

      const newSHAs = await Promise.all([uploadReadMe, uploadNotes, uploadCode, updateRepoReadMe]);

      leetCode.markUploaded();

      if (!alreadyCompleted) {
        // Increments local and persistent stats
        incrementStats(leetCode.difficulty, problemName).then(setPersistentStats);
      }
    } catch (err) {
      leetCode.markUploadFailed();
      clearInterval(intervalId);

      if (!(err instanceof util_CodeVaultError)) {
        console.error('[CodeVault Sync]', err);
        return;
      }
    }
  }, 1000);
}

/**
 * Submit by Keyboard Shortcuts (only supported on LeetCode v2)
 * @param {Event} event
 * @returns
 */
function wasSubmittedByKeyboard(event) {
  const isEnterKey = event.key === 'Enter';
  const isMacOS = window.navigator.userAgent.includes('Mac');

  // Adapt to MacOS operating system
  return isEnterKey && ((isMacOS && event.metaKey) || (!isMacOS && event.ctrlKey));
}

/**
 * Get SubmissionID by listening for URL changes to `/submissions/(d+)` format
 * @returns {string} submissionId
 */
async function leetcode_listenForSubmissionId() {
  const { submissionId } = await leetcode_api.runtime.sendMessage({
    type: 'LEETCODE_SUBMISSION',
  });
  if (submissionId == null) {
    console.log('[CodeVault Sync]', new util_CodeVaultError('SubmissionIdNotFound'));
    return;
  }
  return submissionId;
}

/**
 * @param {Event} event
 * @param {LeetCodeV2} leetCode
 * @returns {void}
 */
async function v2SubmissionHandler(event, leetCode) {
  if (event.type !== 'click' && !wasSubmittedByKeyboard(event)) {
    return;
  }

  const authenticated =
    !isEmptyObject(await leetcode_api.storage.local.get(['codevault_token'])) &&
    !isEmptyObject(await leetcode_api.storage.local.get(['codevault_hook']));
  if (!authenticated) {
    throw new util_CodeVaultError('UserNotAuthenticated');
  }

  // is click or is ctrl enter
  const submissionId = await leetcode_listenForSubmissionId();
  leetCode.submissionId = submissionId;
  loader(leetCode);
  return true;
}

// Use MutationObserver to determine when the submit button elements are loaded
const submitBtnObserver = new MutationObserver(function (_mutations, observer) {
  const v1SubmitBtn = document.querySelector('[data-cy="submit-code-btn"]');
  const v2SubmitBtn = document.querySelector('[data-e2e-locator="console-submit-button"]');
  const textareaList = document.getElementsByTagName('textarea');
  const textarea =
    textareaList.length === 4
      ? textareaList[2]
      : textareaList.length === 2
      ? textareaList[0]
      : textareaList[1];

  if (v1SubmitBtn) {
    observer.disconnect();

    const leetCode = new LeetCodeV1();
    v1SubmitBtn.addEventListener('click', () => loader(leetCode));
    return;
  }

  if (v2SubmitBtn && textarea) {
    observer.disconnect();

    const leetCode = new LeetCodeV2();
    // Mark the button ourselves; LeetCode may set its own onclick, which we must not overwrite
    if (!v2SubmitBtn.dataset.codevaultHooked) {
      v2SubmitBtn.dataset.codevaultHooked = 'true';
      textarea.addEventListener('keydown', e => v2SubmissionHandler(e, leetCode));
      v2SubmitBtn.addEventListener('click', e => v2SubmissionHandler(e, leetCode));
    }
  }
});

submitBtnObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

/* Sync to local storage */
leetcode_api.storage.local.get('isSync', data => {
  const keys = [
    'codevault_token',
    'codevault_username',
    'pipe_codevault',
    'stats',
    'codevault_hook',
    'mode_type',
  ];
  if (!data || !data.isSync) {
    keys.forEach(key => {
      leetcode_api.storage.sync.get(key, data => {
        leetcode_api.storage.local.set({ [key]: data[key] });
      });
    });
    leetcode_api.storage.local.set({ isSync: true }, () => {
      console.log('[CodeVault Sync]', 'CodeVault synced local settings');
    });
  } else {
    console.log('[CodeVault Sync]', 'CodeVault settings already synced');
  }
});

submitBtn(
  debounce(
    () => {
      const leetCode = new LeetCodeV2();
      // Manual submission event can only fire when we have submissionId. Simply retrieve it.
      const submissionMatch = window.location.href.match(/\/submissions\/(\d+)/);
      const submissionId = submissionMatch?.[1];
      if (!submissionId) {
        console.warn('[CodeVault Sync]', 'Could not identify a submission from the current URL.');
        return;
      }
      leetCode.submissionId = submissionId;
      loader(leetCode);
      return;
    },
    5000,
    true
  )
);

async function scanSolvedProblemFallback(csrfToken) {
  const headers = { accept: 'application/json', 'content-type': 'application/json', 'x-csrftoken': csrfToken, 'x-requested-with': 'XMLHttpRequest' };
  const solvedResponse = await fetch('https://leetcode.com/api/problems/all/', { credentials: 'include', headers });
  if (!solvedResponse.ok) throw new Error('LeetCode did not allow access to your solved-problem list.');
  const solvedPairs = (await solvedResponse.json()).stat_status_pairs?.filter(item => item.status === 'ac') || [];
  const query = 'query submissions($offset: Int!, $limit: Int!, $lastKey: String, $questionSlug: String!) { submissionList(offset: $offset, limit: $limit, lastKey: $lastKey, questionSlug: $questionSlug) { submissions { id statusDisplay lang timestamp } } }';
  const output = [];
  for (const pair of solvedPairs) {
    const slug = pair.stat?.question__title_slug;
    if (!slug) continue;
    const response = await fetch('https://leetcode.com/graphql/', { method: 'POST', credentials: 'include', headers, body: JSON.stringify({ operationName: 'submissions', variables: { offset: 0, limit: 20, lastKey: null, questionSlug: slug }, query }) });
    const rows = (await response.json().catch(() => ({})))?.data?.submissionList?.submissions || [];
    const accepted = rows.find(item => item.statusDisplay === 'Accepted');
    if (accepted) output.push({ id: accepted.id, title: pair.stat.question__title, titleSlug: slug, timestamp: accepted.timestamp, lang: accepted.lang });
  }
  return output;
}

/* Read-only history scan for the dashboard importer. No GitHub writes occur here. */
leetcode_api.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.type !== 'CODEVAULT_SCAN_HISTORY') return;
  (async () => {
    const statusQuery = { query: 'query { userStatus { username } }' };
    const status = await fetch('https://leetcode.com/graphql/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(statusQuery) }).then(response => response.json());
    const username = status?.data?.userStatus?.username;
    if (!username) throw new Error('Sign in to LeetCode first.');
    const submissions = [];
    const seen = new Set();
    let offset = 0;
    let hasNext = true;
    const csrfToken = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1] || '';
    while (hasNext) {
      const urls = [
        `https://leetcode.com/api/submissions/?offset=${offset}&limit=20`,
        `https://leetcode.com/api/submissions/${encodeURIComponent(username)}/?offset=${offset}&limit=20`,
      ];
      let response;
      for (const url of urls) {
        const candidate = await fetch(url, { credentials: 'include', headers: { accept: 'application/json', 'x-csrftoken': csrfToken, 'x-requested-with': 'XMLHttpRequest' } });
        if (candidate.ok) { response = candidate; break; }
      }
      if (!response) { submissions.push(...await scanSolvedProblemFallback(csrfToken)); break; }
      const page = await response.json();
      const rows = page.submissions_dump || page.submissions || page.results || [];
      for (const item of rows) {
        const questionKey = item.title_slug || item.titleSlug || item.id;
        if ((item.status_display === 'Accepted' || item.statusDisplay === 'Accepted') && !seen.has(questionKey)) {
          seen.add(questionKey);
          submissions.push({ id: item.id, title: item.title, titleSlug: item.title_slug || item.titleSlug, timestamp: item.timestamp, lang: item.lang });
        }
      }
      offset += rows.length;
      hasNext = Boolean(page.has_next || page.hasNext);
      if (!rows.length) break;
    }
    // LeetCode's submission-history endpoint may return a capped or partial
    // timeline. Merge it with the signed-in account's complete solved list so
    // the importer offers every unique accepted problem, not just the first page.
    try {
      const solvedFallback = await scanSolvedProblemFallback(csrfToken);
      for (const item of solvedFallback) {
        const key = item.titleSlug || item.id;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        submissions.push(item);
      }
    } catch (_error) {
      // Keep the submissions already read when LeetCode temporarily declines
      // the supplemental solved-list request.
    }
    submissions.sort((left, right) => Number(right.timestamp || 0) - Number(left.timestamp || 0));
    sendResponse({ ok: true, username, submissions });
  })().catch(error => sendResponse({ ok: false, error: error.message }));
  return true;
});

/* Imports previously accepted submissions only after an explicit dashboard confirmation. */
async function importHistoricalSubmissionLegacy(submissionId) {
  const leetCode = new LeetCodeV2();
  leetCode.submissionId = Number(submissionId);
  await leetCode.init();
  const probStats = leetCode.parseStats();
  const problemName = leetCode.getProblemNameSlug();
  const language = leetCode.getLanguageExtension();
  const filename = problemName + language;
  const code = leetCode.findCode();
  const submission = leetCode.submissionData;
  const submittedAt = submission?.timestamp ? new Date(Number(submission.timestamp) * 1000).toLocaleString() : 'Unknown';
  const questionUrl = `https://leetcode.com/problems/${submission.question.titleSlug}/`;
  const problemStatement = `<h2><a href="${questionUrl}">${submission.question.questionId}. ${submission.question.title}</a></h2><h3>${leetCode.parseDifficulty()}</h3><hr>${leetCode.parseQuestionDescription()}`;
  const details = {
    code,
    codeLanguage: submission?.lang?.name || '',
    language: submission?.lang?.verboseName || language.replace('.', ''),
    submittedAt,
    runtime: submission?.runtimeDisplay,
    memory: submission?.memoryDisplay,
    runtimePercentile: submission?.runtimePercentile != null ? `${Number(submission.runtimePercentile).toFixed(2)}%` : '',
    memoryPercentile: submission?.memoryPercentile != null ? `${Number(submission.memoryPercentile).toFixed(2)}%` : '',
    tags: submission?.question?.topicTags,
  };
  const alreadyCompleted = await isCompleted(problemName);
  const { question_readme_theme = 'classic', stats = {} } = await leetcode_api.storage.local.get(['question_readme_theme', 'stats']);
  const readme = formatQuestionReadmeFinal(problemStatement, question_readme_theme, details);
  const uploadReadme = stats?.shas?.[problemName]?.[readmeFilename] === undefined
    ? uploadGitWith409Retry(encode(readme), problemName, readmeFilename, `docs: add ${problemName} record`)
    : Promise.resolve();
  await Promise.all([
    uploadReadme,
    uploadGitWith409Retry(encode(code), problemName, filename, `feat: import ${problemName} solution`),
    updateReadmeTopicTagsWithProblem(submission?.question?.topicTags, problemName),
  ]);
  if (!alreadyCompleted) await incrementStats(leetCode.parseDifficulty(), problemName).then(setPersistentStats);
  return { id: submissionId, title: submission.title, path: problemName };
}

async function historicalGitRequest(token, hook, path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${hook}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `GitHub request failed (${response.status}).`);
  return data;
}

async function historicalGitHubUser(token) {
  const response = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } });
  const user = await response.json().catch(() => ({}));
  if (!response.ok || !user.login || !user.id) throw new Error('GitHub could not read the signed-in account identity.');
  return user;
}

async function importHistoricalSubmission(submissionId, preserveOriginalDate = true) {
  const leetCode = new LeetCodeV2();
  leetCode.submissionId = Number(submissionId);
  await leetCode.init();
  const submission = leetCode.submissionData;
  const problemName = leetCode.getProblemNameSlug();
  if (await isCompleted(problemName)) return { id: submissionId, title: submission.title, path: problemName, skipped: true };

  const language = leetCode.getLanguageExtension();
  const filename = problemName + language;
  const code = leetCode.findCode();
  const submittedAt = submission?.timestamp ? new Date(Number(submission.timestamp) * 1000).toLocaleString() : 'Unknown';
  const submittedIso = preserveOriginalDate && submission?.timestamp ? new Date(Number(submission.timestamp) * 1000).toISOString() : new Date().toISOString();
  const problemStatement = `<h2><a href="https://leetcode.com/problems/${submission.question.titleSlug}/">${submission.question.questionId}. ${submission.question.title}</a></h2><h3>${leetCode.parseDifficulty()}</h3><hr>${leetCode.parseQuestionDescription()}`;
  const { codevault_token: token, codevault_hook: hook, default_branch = 'main', question_readme_theme = 'classic', stats: savedStats } = await leetcode_api.storage.local.get(['codevault_token','codevault_hook','default_branch','question_readme_theme','stats']);
  if (!token || !hook) throw new Error('Connect GitHub and choose a repository first.');

  const details = { title: submission?.title || leetCode.parseQuestionTitle(), code, codeLanguage: submission?.lang?.name || '', language: submission?.lang?.verboseName || language.replace('.', ''), submittedAt, runtime: submission?.runtimeDisplay, memory: submission?.memoryDisplay, runtimePercentile: submission?.runtimePercentile != null ? `${Number(submission.runtimePercentile).toFixed(2)}%` : '', memoryPercentile: submission?.memoryPercentile != null ? `${Number(submission.memoryPercentile).toFixed(2)}%` : '', tags: submission?.question?.topicTags };
  const questionReadme = formatQuestionReadmeFinal(problemStatement, question_readme_theme, details);
  const stats = savedStats?.shas ? structuredClone(savedStats) : { shas: {}, solved: 0, easy: 0, medium: 0, hard: 0 };
  stats.shas[problemName] = stats.shas[problemName] || {};
  const difficulty = getDifficulty(leetCode.parseDifficulty()).toLowerCase();
  stats.solved += 1; stats.easy += difficulty === 'easy' ? 1 : 0; stats.medium += difficulty === 'medium' ? 1 : 0; stats.hard += difficulty === 'hard' ? 1 : 0;
  stats.shas[problemName].difficulty = difficulty;

  let rootReadme;
  try { rootReadme = decode((await getGitHubFile(token, hook, readmeFilename, '').then(response => response.json())).content); }
  catch (_error) { rootReadme = defaultRepoReadme; }
  const topicTags = submission?.question?.topicTags || [];
  for (const tag of topicTags) rootReadme = appendProblemToReadme(tag.name, rootReadme, hook, problemName);
  if (topicTags.length) rootReadme = sortTopicsInReadme(rootReadme);

  const ref = await historicalGitRequest(token, hook, `/git/ref/heads/${encodeURIComponent(default_branch)}`);
  const parent = await historicalGitRequest(token, hook, `/git/commits/${ref.object.sha}`);
  const createBlob = content => historicalGitRequest(token, hook, '/git/blobs', 'POST', { content, encoding: 'utf-8' });
  const [codeBlob, questionBlob, rootBlob, user] = await Promise.all([
    createBlob(code), createBlob(questionReadme), createBlob(rootReadme), historicalGitHubUser(token),
  ]);
  stats.shas[problemName][filename] = codeBlob.sha;
  stats.shas[problemName][readmeFilename] = questionBlob.sha;
  stats.shas[readmeFilename] = { '': rootBlob.sha };
  const statsBlob = await createBlob(JSON.stringify({ leetcode: stats }, null, 2));
  const tree = await historicalGitRequest(token, hook, '/git/trees', 'POST', { base_tree: parent.tree.sha, tree: [
    { path: `${problemName}/${filename}`, mode: '100644', type: 'blob', sha: codeBlob.sha },
    { path: `${problemName}/${readmeFilename}`, mode: '100644', type: 'blob', sha: questionBlob.sha },
    { path: readmeFilename, mode: '100644', type: 'blob', sha: rootBlob.sha },
    { path: statsFilename, mode: '100644', type: 'blob', sha: statsBlob.sha },
  ] });
  const identity = { name: user.login, email: `${user.id}+${user.login}@users.noreply.github.com`, date: submittedIso };
  const commit = await historicalGitRequest(token, hook, '/git/commits', 'POST', { message: `feat: sync ${problemName.replace(/^\d+-/, '').replaceAll('-', ' ')} solution`, tree: tree.sha, parents: [ref.object.sha], author: identity, committer: identity });
  await historicalGitRequest(token, hook, `/git/refs/heads/${encodeURIComponent(default_branch)}`, 'PATCH', { sha: commit.sha, force: false });
  await leetcode_api.storage.local.set({ stats });
  return { id: submissionId, title: submission.title, path: problemName, committedAt: submittedIso };
}

leetcode_api.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request?.type !== 'CODEVAULT_IMPORT_HISTORY') return;
  (async () => {
    const ids = [...new Set((request.submissionIds || []).map(Number).filter(Number.isFinite))].slice(0, 15);
    if (!ids.length) throw new Error('Choose at least one accepted submission.');
    const results = [];
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      try { results.push({ ok: true, ...(await importHistoricalSubmission(id, request.dateMode !== 'today')) }); }
      catch (error) { results.push({ ok: false, id, error: error.message || 'Import failed' }); }
      await leetcode_api.runtime.sendMessage({ type: 'HISTORY_IMPORT_PROGRESS', progress: { completed: (Number(request.progressOffset) || 0) + index + 1, total: Number(request.total) || ids.length, failed: results.filter(item => !item.ok).length } });
    }
    sendResponse({ ok: true, results });
  })().catch(error => sendResponse({ ok: false, error: error.message }));
  return true;
});

class CodeVaultNetworkError extends util_CodeVaultError {
  constructor(response) {
    super(response.statusText);
    this.status = response.status;
  }
}

/******/ })()
;
