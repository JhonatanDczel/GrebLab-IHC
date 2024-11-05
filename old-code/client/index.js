// Variables que almacenan referencias a los elementos HTML específicos por ID.
const outputDiv = document.getElementById('output-div'); // Div para mostrar la salida generada.
const outputSection = document.getElementById('output-section'); // Sección que contiene el output.
const codeSection = document.getElementById('code-section'); // Sección que contiene el editor de código.
const codeTextArea = document.getElementById('code-area'); // Área de texto donde el usuario escribe el código.

const codeContainer = document.getElementById('code-container'); // Contenedor principal para el editor de código.
const renderedCodeContainer = document.getElementById('rendered-code-container'); // Contenedor que muestra el código procesado.
const runCodeButton = document.getElementById('run-button'); // Botón para ejecutar el código.
const samplesContainer = document.getElementById('samples'); // Contenedor para las muestras de código.
const activitiesContainer = document.getElementById('activities'); // Contenedor para las actividades disponibles.
const teacherEditNotification = document.getElementById('teacher-edit-notification'); // Notificación de edición remota por parte del profesor.
const testCasesContainer = document.getElementById("test-cases"); // Contenedor de los casos de prueba.
const testCasesOutputContainer = document.getElementById("output-section"); // Contenedor de la salida de los casos de prueba.

const breakoutSelect = document.getElementById('room-select'); // Selector de salas (breakout rooms).
const nameInput = document.getElementById('name-select'); // Input para ingresar el nombre del usuario.
const lessonPicker = document.getElementById('lesson-picker'); // Selector de lecciones.
const loggedInView = document.getElementById('logged-in-view'); // Vista principal para usuarios logueados.
const loginForm = document.getElementById('login-form'); // Formulario de inicio de sesión.

// Función que carga las opciones de salas (breakout rooms) en el selector.
function loadBreakoutRooms() {
  // Elimina todas las opciones de sala actuales.
  while (breakoutSelect.firstChild) {
    breakoutSelect.removeChild(breakoutSelect.firstChild);
  }
  // Agrega las salas disponibles desde un arreglo llamado BREAKOUT_ROOMS.
  for (const room of BREAKOUT_ROOMS) {
    const option = document.createElement('option'); // Crea un elemento de opción para cada sala.
    option.innerHTML = room; // Establece el nombre de la sala como el texto de la opción.
    breakoutSelect.appendChild(option); // Agrega la opción al selector de salas.
  }
}
loadBreakoutRooms(); // Llama a la función para cargar las salas al cargar la página.

// Función para iniciar sesión en la aplicación.
function login() {
  // Verifica que el usuario haya seleccionado una sala y un nombre.
  if (breakoutSelect.value && nameInput.value) {
    const userName = breakoutSelect.value + ' | ' + nameInput.value; // Crea un nombre de usuario combinando sala y nombre.
    document.getElementById('user-name').innerHTML = userName; // Muestra el nombre del usuario en la interfaz.
    editor.setUserName(userName); // Establece el nombre de usuario en el editor.

    loggedInView.style.display = 'inline'; // Muestra la vista logueada.
    loginForm.style.display = 'none'; // Oculta el formulario de inicio de sesión.

    editor.onSessionStart(); // Llama al método para iniciar la sesión del editor.
  } else {
    alert('Breakout room or name missing.'); // Muestra una alerta si falta la sala o el nombre.
  }
}

// Función para iniciar sesión en modo revisión.
function loginForReview() {
  editor.setUserName("LOCAL-REVIEW"); // Establece el nombre de usuario para el modo de revisión.
  loggedInView.style.display = 'inline'; // Muestra la vista logueada.
  loginForm.style.display = 'none'; // Oculta el formulario de inicio de sesión.

  // Carga la lección seleccionada en lessonPicker.
  GlobalState.currentLesson = lessonPicker.value; // Establece la lección actual en GlobalState.
  GlobalState.isUnitTestSetup = lessonPicker.value === Titles.UNIT_TESTING || lessonPicker.value === Titles.ADVANCED_UNIT_TESTING; // Configura si se trata de pruebas unitarias.
  console.log(GlobalState); // Muestra el estado global en la consola para depuración.
  editor.onSessionStart(); // Llama al método para iniciar la sesión del editor.
}

// Asocia los botones de inicio de sesión a las funciones correspondientes.
document.getElementById('login-button').addEventListener('click', login); // Botón de inicio de sesión estándar.
document.getElementById('review-login-button').addEventListener('click', loginForReview); // Botón de inicio de sesión para modo revisión.

// Inicializa el editor de código con los elementos necesarios y el rol de estudiante.
const editor = new CodeEditor(
  ROLE.STUDENT, // Establece el rol del usuario como "estudiante".
  {
    codeTextArea, // Área de texto para el código.
    codeContainer, // Contenedor del editor.
    renderedCodeContainer, // Contenedor del código procesado.
    outputDiv, // Div para mostrar la salida del código.
    studentButtonContainer: null, // Contenedor de botones para estudiantes (actualmente null).
    studentCodeTitle: null, // Título del código del estudiante (actualmente null).
    remoteEditNotificationText: teacherEditNotification, // Notificación de edición remota.
    testCasesContainer, // Contenedor de casos de prueba.
    testCasesOutputContainer, // Contenedor de salida para los casos de prueba.
    samplesContainer, // Contenedor de muestras de código.
    activitiesContainer, // Contenedor de actividades.
    outputSection, // Sección de salida.
    codeSection // Sección del editor de código.
  }
);

// El código comentado puede solicitar al usuario un nombre o iniciar sesión automáticamente.
// setTimeout(promptForUserName, 10); // Temporizador para solicitar nombre de usuario (desactivado).
// login(); // Llamada a login automática (comentada).
document.getElementById('name-select').addEventListener('change', function() {
  const selectedName = this.value;
  const password = document.getElementById('password').value;

  // Puedes añadir más lógica aquí para manejar la selección de nombre y el campo de contraseña
  console.log('Selected name:', selectedName);
  console.log('Entered password:', password);
});
