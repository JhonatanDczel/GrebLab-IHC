const NO_QUESTION = "noquestion";

class CodeEditor {
  constructor(
    userRole, uiElts) {
    this.userRole = userRole;
    this.codeTextArea = uiElts.codeTextArea;
    this.codeContainer = uiElts.codeContainer;
    this.samplesContainer = uiElts.samplesContainer;
    this.activitiesContainer = uiElts.activitiesContainer;
    this.outputSection = uiElts.outputSection;
    this.renderedCodeContainer = uiElts.renderedCodeContainer;
    this.outputDiv = uiElts.outputDiv;
    this.studentButtonContainer = uiElts.studentButtonContainer;
    this.studentCodeTitle = uiElts.studentCodeTitle;
    this.remoteEditNotificationText = uiElts.remoteEditNotificationText;
    this.testCasesContainer = uiElts.testCasesContainer;
    this.testCasesOutputContainer = uiElts.testCasesOutputContainer;

    // UI Setup
    this.codeTextArea.style.visibility = 'hidden';
    this.testCasesContainer.style.display = 'none';

    // Event listeners
    codeTextArea.addEventListener('input', this.onCodeChangedByUser);
    this.forEachTestCase((caseElt, answerElt, _) => {
      caseElt.addEventListener('input', this.onCodeChangedByUser);
      answerElt.addEventListener('input', this.onCodeChangedByUser);
    })
    runCodeButton.addEventListener('click', this.runCode);
    allowTabbing(codeTextArea, this.onCodeChangedByUser);

    // State variables
    this.dataModel = this.getDefaultDataModel();
    this.hasChangedCode = false;
    this.codeVersion = 0;
    this.userName = '';
    this.dataLookupByStudent = null;
    this.ticksUntilPush = -1;
    this.ticksSinceLastRefreshCount = 0;
    this.numRefreshesSinceLastCount = 0;

    this.syncWithServer();
    this.tickLoop();
  }

  /** Helper method to automatically loop over all test cases */
  forEachTestCase = (consumerFun) => {
    for (let i = 0; i < NUM_TEST_CASES; i++) {
      const caseInput = document.getElementById("case-" + i);
      const answerInput = document.getElementById("answer-" + i);
      const outputDiv = document.getElementById("output-" + i);
      consumerFun(caseInput, answerInput, outputDiv)
    }
  }

  getCodeVersion =
    () => {
      return this.codeVersion;
    }

  incrementVersion =
    () => {
      this.codeVersion = Math.floor(this.codeVersion) +
        (this.userRole == ROLE.STUDENT ? STUDENT_VERSION_INCREMENT :
          TEACHER_VERSION_INCREMENT);
      console.log('Incremented local code version to:', this.codeVersion);
    }

  /** 
   * Loads a code segment into a text element, and maybe makes the text box not 
   * editable depending on the presence of a "lock" indicator. 
   */
  loadCodeSegmentToTextBox = (newCode, textBoxElt) => {
    if (newCode.substring(0, LOCK_MARKER.length) === LOCK_MARKER) {
      textBoxElt.readOnly = true;
      textBoxElt.style.background = DISABLED_TEXT_AREA_COLOR;
      textBoxElt.value = newCode.substring(LOCK_MARKER.length);
    } else {
      textBoxElt.readOnly = false;
      textBoxElt.style.background = ENABLED_TEXT_AREA_COLOR;
      textBoxElt.value = newCode;
    }
  }

  getCodeSegmentFromTextBox = (textBoxElt) => {
    return (textBoxElt.readOnly ? LOCK_MARKER : "") + textBoxElt.value
  }

  loadDataModelToUi = (newVersion, newDataModel) => {
    this.dataModel = newDataModel;
    this.codeVersion = newVersion;
    this.selectQuestion(newDataModel.currentQuestion);
    this.codeVersion = newVersion;
  }

  /** Loads any code into the UI. */
  loadSingleQuestionCodeToUi =
    (newCode) => {
      const split = newCode.split(TEST_CONCAT_DELIM);
      console.log("split code:", split);

      // Main component goes to main area
      this.loadCodeSegmentToTextBox(split[0], this.codeTextArea);

      // Then load test components
      let i = 0;
      this.forEachTestCase((caseElt, answerElt, _) => {
        if (caseElt && answerElt) {
          const caseValue = split[(2 * i) + 1] || ""
          const answerValue = split[(2 * i) + 2] || ""
          this.loadCodeSegmentToTextBox(caseValue, caseElt)
          this.loadCodeSegmentToTextBox(answerValue, answerElt)
        }
        i++
      })
      this.onCodeChanged(/* byUser= */ false);
      this.outputDiv.innerHTML = '';
    }

  loadSamplesAndActivies = () => {
    SAMPLES_LISTS[GlobalState.currentLesson].forEach((sample) => {
      if (sample === 'newline') {
        this.samplesContainer.appendChild(document.createElement('br'));
        return;
      }
      const button = document.createElement('button');
      button.innerHTML = sample.title;
      button.onclick = () => this.selectQuestion(sample.title);
      this.samplesContainer.appendChild(button);
    })

    ACTIVITIES_LISTS[GlobalState.currentLesson].forEach((sample) => {
      if (sample === 'newline') {
        this.activitiesContainer.appendChild(document.createElement('br'));
        return;
      }
      const button = document.createElement('button');
      button.innerHTML = sample.title;
      button.onclick = () => this.selectQuestion(sample.title);
      this.activitiesContainer.appendChild(button);
    })

    console.log("Loading samples and activities", GlobalState, this.testCasesContainer);
    if (GlobalState.isUnitTestSetup) {
      outputSection.style.display = "none";
      this.testCasesContainer.style.display = 'block';
    } else {
      this.testCasesContainer.style.display = 'none';
      outputSection.style.display = 'block';
    }
  }

  /** Selects a given question */
  selectQuestion = (questionTitle) => {
    this.dataModel.currentQuestion = questionTitle;
    this.loadSingleQuestionCodeToUi(this.dataModel[questionTitle].code);
    document.getElementById('instructions').innerHTML = this.dataModel[questionTitle].instructions;
  }

  /** Loads all the sample code into the current code lookup */
  getDefaultDataModel = () => {
    const defaultDataModel = {}
    defaultDataModel[NO_QUESTION] = { title: "", instructions: "Select a code sample or an activity above.", code: "" };
    defaultDataModel.currentQuestion = NO_QUESTION;

    // Add the code samples to the default data model
    SAMPLES_LISTS[GlobalState.currentLesson].forEach((sample) => {
      defaultDataModel[sample.title] = sample
    })
    ACTIVITIES_LISTS[GlobalState.currentLesson].forEach((sample) => {
      defaultDataModel[sample.title] = sample
    })

    return defaultDataModel;
  }

  resetTestResults = () => {
    this.forEachTestCase((_, __, output) => {
      output.innerHTML = "";
      output.parentElement.style.background = "transparent";
    })
  }



  runTests = () => {
    this.resetTestResults();

    this.forEachTestCase((caseElt, answerElt, output) => {
      const baseCode = codeTextArea.value.replace(/print/g, "");
      const testCode = caseElt.value;
      if (!testCode || !baseCode) {
        return;
      }

      const expectedAnswer = answerElt.value.replace(/"|'/g, ""); // Remove quotes from the answer
      const expectException = expectedAnswer.includes("Exception")

      // Execute the test code
      let realAnswer;
      let gotRuntimeException = false;
      let gotError = false;
      try {
        const combinedCode = this.recompileCode(baseCode) + "\n" + testCode;
        const result = eval(combinedCode);
        console.log("RESULT=", result);
        if (result === undefined) {
          realAnswer = "undefined";
        } else if (result == "Infinity") {
          realAnswer = "IllegalArgumentException: cannot divide by 0"
          gotRuntimeException = true;
        } else if (Number.isNaN(result)) {
          realAnswer = "Exception: result was not a number";
          gotRuntimeException = true;
        } else {
          realAnswer = result;
        }
      } catch (e) {
        if (e instanceof ReferenceError || e instanceof SyntaxError) {
          realAnswer = e
          gotError = true;
        } else {
          realAnswer = "Exception: " + e
          gotRuntimeException = true;
        }
      }
      console.log("REAL", realAnswer, "EXPECTED", expectedAnswer);
      const semanticAnswer = gotRuntimeException ? "Exception" : realAnswer;

      // Display feedback based on the correctness of the answer
      output.style.fontWeight = "bold";
      if (gotError) {
        output.innerHTML = `Error while running test!<br/><em>${realAnswer}</em`;
        output.parentElement.style.background = "#e18080";
      } else if (semanticAnswer.toString() === expectedAnswer.toString()) {
        output.innerHTML = "Test passed!";
        if (expectException) {
          output.innerHTML += "<br/>Got: " + realAnswer
        }
        output.parentElement.style.background = "lightgreen";
      }
      else {
        console.log("parsed real answer", realAnswer, parseInt(realAnswer));
        output.innerHTML = `Test failed. <br/>Expected: <em>${expectedAnswer}</em><br/>Got: <em>${realAnswer}</em>`;
        output.parentElement.style.background = "pink";
      }
    })
  }

  /**
     Callback when the code is edited, either by the user or by a server
     update.
   */
  onCodeChanged =
    (byUser) => {
      if (byUser) {
        this.hasChangedCode = true;
        this.schedulePush();
      } else {
        // Local changes were overwritten
        this.hasChangedCode = false;
      }

      // Update the local data lookup
      this.updateDataModel();

      // Update the rendered layer to overlay the input layer pixel-for-pixel
      this.renderCodeWithSyntaxHighlighting(
        codeTextArea.value, renderedCodeContainer);
      this.textAreaAdjust(
        codeTextArea, [codeContainer, renderedCodeContainer]);
    }

  onCodeChangedByUser =
    () => {
      this.onCodeChanged(/* byUser= */ true);
    }

  /**
     (For teachers only) Renders a list of students, filtered by what room the
     teacher has selected.
   */
  renderStudentButtons =
    () => {
      // Get existing button list
      let oldList = [];
      for (const btn of this.studentButtonContainer.childNodes) {
        oldList.push(btn.innerHTML);
      }

      // Check for a room filter
      const breakoutSelect = document.getElementById('ta-room-select');
      const taRoom = breakoutSelect.value;

      // Get new list
      let newList = [];
      for (const student of Object.keys(this.dataLookupByStudent).sort()) {
        const [studentRoom, studentName] = student.split(' | ');
        if (studentRoom !== taRoom && taRoom !== '(all rooms)') {
          continue;
        }
        newList.push(student);
      }

      if (JSON.stringify(newList.map(x => x.split(' | ')[1])) !==
        JSON.stringify(oldList)) {
        // Clear existing buttons
        while (this.studentButtonContainer.firstChild) {
          this.studentButtonContainer.removeChild(
            this.studentButtonContainer.firstChild);
        }

        // Render new buttons
        for (const student of newList) {
          const [studentRoom, studentName] = student.split(' | ');
          const button = document.createElement('button');
          button.innerHTML = studentName;
          button.onclick = () => {
            if (activitiesContainer.children.length == 0) {
              this.loadSamplesAndActivies();
            }
            this.setUserName(student);
            this.studentCodeTitle.innerHTML = `${student}'s Code:`
            this.resetTestResults();
          };
          this.studentButtonContainer.appendChild(button);
        }
      }
    }

  /** Uses the Prism library to render code with syntax highlighting */
  renderCodeWithSyntaxHighlighting =
    (codeText, parentElt) => {
      /* Create pre code */
      let code = document.createElement('code');
      code.className = 'language-javascript';

      codeText = codeText.replace(/(?:\r\n|\r|\n)/g, '\r\n');
      code.innerHTML = codeText;

      let pre = document.createElement('pre');
      pre.setAttribute('aria-hidden', 'true');  // Hide for screen readers
      pre.style.background = 'transparent';
      pre.append(code);

      while (parentElt.firstChild) {
        parentElt.removeChild(parentElt.firstChild);
      }
      parentElt.appendChild(pre);
      Prism.highlightElement(code);
    }

  /**
     Make some modifications to the code to prepare it for running on the site.
     Notably, implement the 'print' function using a slightly suspicious regex
     replacement.
   */
  recompileCode =
    (code) => {
      let newString = 'let output = "";\n'

      // Replace 'int' with 'let'
      code = code.replace(/int[ A-Za-z0-9_-]*=/g, function (match) {
        return match.replace('int', 'let');
      });

      // Replace console.log
      code = code.replace(/console\.log/g, 'output += "<br/>" + ')
      // Replace print statements
      code = code.replace(/print/g, 'output += "<br/>" + ');
      // Replace exception statements
      // code = code.replace(/Exception\(/g, 'throw new Error(');

      newString += code;
      newString += '\nthis.showOutput(output)';
      return newString;
    }

  /** Execute the code in the text area. */
  runCode =
    () => {
      if (GlobalState.isUnitTestSetup) {
        this.runTests();
      } else {
        // Clear old output
        this.outputDiv.innerHTML = '';
        // Put code output to div
        setTimeout(() => {
          const code = codeTextArea.value;
          console.log('\nOriginal code:\n' + code);
          const newCode = this.recompileCode(code);
          console.log('\nGenerated code:\n' + newCode);

          try {
            eval(newCode);
          } catch (error) {
            this.showOutput('Exception - ' + error.message);
          }
        }, 300);
      }

    }

  /** Set the name of the student whose code is being edited. */
  setUserName =
    (newName) => {
      this.userName = newName;

      // Show the editor section for the first time
      if (newName) {
        this.codeTextArea.style.visibility = 'visible';
        if (GlobalState.isUnitTestSetup) {
          this.testCasesContainer.style.display = "block";
        }
      }

      // Maybe load their code from the map
      if (this.dataLookupByStudent !== null && this.dataLookupByStudent.hasOwnProperty(newName)) {
        const [remoteVersion, remoteCodeObj] = this.dataLookupByStudent[this.userName];
        this.loadDataModelToUi(remoteVersion, remoteCodeObj);
      } else {
        console.log('Set user name, not loading from map')
        // Schedule an initial push to show that the user is present
        if (this.userRole == ROLE.STUDENT) {
          this.schedulePush();
        }
      }
    }

  /**
   * Display output from the user's code in a div on the webpage
   * @param {string} outputStr
   */
  showOutput =
    (outputStr) => {
      if (outputStr.indexOf(NEWLINE) == 0) {
        outputStr = outputStr.replace(NEWLINE, '');
      }
      if (outputStr && outputStr.length > 0) {
        this.outputDiv.innerHTML = outputStr;
      } else {
        this.outputDiv.innerHTML = '(Finished running. There was no output.)';
      }
    }

  /**
   * Align the heights and widths of all the elements related to the text area.
   * @param {*} element - the main text area
   * @param {*} syncedElements - all elements whose size follows that of the
   *     main text area
   */
  textAreaAdjust =
    (element, syncedElements) => {
      element.style.height = '1px';
      element.style.width = '1px';
      const newHeight = (25 + element.scrollHeight) + 'px';
      const newWidth = (25 + element.scrollWidth) + 'px';
      for (const elt of [element, ...syncedElements]) {
        elt.style.height = newHeight;
        elt.style.width = newWidth;
      }
    }

  pullFromServer =
    () => {
      fetch(SERVER_URL + '/data')
        .then(response => response.json())
        .then((array) => {
          const [newMap, serverLagMultiplier] = array;
          antiDdosMultiplier = serverLagMultiplier;

          console.log('Fetched. Refresh multiplier =', antiDdosMultiplier);
          this.numRefreshesSinceLastCount += 1;
          // Pull code
          if (newMap.hasOwnProperty(this.userName)) {
            const [remoteVersion, remoteCodeObj] = newMap[this.userName];
            const oldVersion = this.codeVersion
            console.log("Pulled from server. New version:", remoteVersion, "Old:", oldVersion);

            // Maybe load code to the UI
            if (remoteVersion > oldVersion) {
              // Maybe show a notification that a teacher has edited your code
              if (this.userRole === ROLE.STUDENT &&
                this.remoteEditNotificationText !== null) {
                if (!Number.isInteger(this.codeVersion) && !this.hasChangedCode) {
                  this.remoteEditNotificationText.style.visibility = 'visible';
                } else {
                  this.remoteEditNotificationText.style.visibility = 'hidden';
                }
              }

              this.loadDataModelToUi(remoteVersion, remoteCodeObj)
            }
            // If teacher, maybe overwrite student code
            else if (this.userRole === ROLE.TEACHER &&
              remoteVersion < oldVersion) {
              const updatedDataModel = JSON.parse(JSON.stringify(this.dataModel));
              newMap[this.userName] = [this.codeVersion, updatedDataModel];
            }
          }

          // Pull student list
          if (this.userRole === ROLE.TEACHER) {
            this.dataLookupByStudent = newMap;
            this.renderStudentButtons();
          }
        });
    }

  updateDataModel = () => {
    const newLookup = JSON.parse(JSON.stringify(this.dataModel));
    let currentQuestionCode = this.getCodeSegmentFromTextBox(this.codeTextArea);
    // Maybe add unit test code
    if (GlobalState.isUnitTestSetup) {
      this.forEachTestCase((caseElt, answerElt, _) => {
        if (caseElt && answerElt) {
          currentQuestionCode += DELIM + this.getCodeSegmentFromTextBox(caseElt)
          currentQuestionCode += DELIM + this.getCodeSegmentFromTextBox(answerElt);
        }
      })
    }
    // Update the local question -> code map
    console.log("New code:", currentQuestionCode, this.dataModel.currentQuestion, this.dataModel);
    newLookup[this.dataModel.currentQuestion].code = currentQuestionCode;
    console.log("New lookup:", newLookup);
    this.dataModel = newLookup;
  }

  pushToServer =
    () => {
      if (this.hasChangedCode || this.codeVersion === 0) {
        this.incrementVersion();
        this.makePostRequest(
          {
            name: this.userName,
            version: this.codeVersion,
            dataModel: this.dataModel
          },
          () => { console.log('Posted to server.') });
        this.hasChangedCode = false;
      }
    }

  makePostRequest =
    (body, callback) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', SERVER_URL, true);

      // Send the proper header information along with the request
      xhr.setRequestHeader('Content-Type', 'application/json');

      // Call a function when the state changes.
      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          callback();
        }
      };

      // Send the request
      xhr.send(JSON.stringify(body));
    }

  schedulePush =
    () => {
      this.ticksUntilPush = Math.round(EDIT_TO_PUSH_DELAY_MS / TICK_MS);
    }

  syncWithServer =
    () => {
      // Update the code version if it was changed
      if (this.hasChangedCode) {
        this.incrementVersion();
      }

      // Pull
      this.pullFromServer();

      // Auto-loop
      setTimeout(
        this.syncWithServer,
        antiDdosMultiplier *
        (this.userRole === ROLE.STUDENT ? STUDENT_SYNC_INTERVAL_MS :
          TEACHER_SYNC_INTERVAL_MS));
    }

  tickLoop = () => {
    // Push to server if ready, or keep waiting
    if (this.ticksUntilPush === 0) {
      this.pushToServer();
      this.ticksUntilPush = -1;
    } else if (this.ticksUntilPush !== -1) {
      this.ticksUntilPush -= 1;
    }

    if (this.ticksSinceLastRefreshCount > SERVER_LAG_MONITORING_PERIOD_TICKS) {
      this.ticksSinceLastRefreshCount = 0;
      console.log('Num refreshes:', this.numRefreshesSinceLastCount);
      this.numRefreshesSinceLastCount = 0;
    }
    this.ticksSinceLastRefreshCount += 1;

    // Auto-loop
    setTimeout(this.tickLoop, TICK_MS);
  }
}

// Util function that allows the textarea to handle the tab character
function allowTabbing(textarea, onTabCallback) {
  textarea.addEventListener('keydown', function (e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;

      // Set textarea value to: text before caret + tab + text after caret
      this.value =
        this.value.substring(0, start) + '\t' + this.value.substring(end);

      // Put caret at right position again
      this.selectionStart = this.selectionEnd = start + 1;

      onTabCallback();
    }
  });
}
allowTabbing = allowTabbing.bind(this);