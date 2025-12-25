// script.js
document.getElementById('checkButton').addEventListener('click', function() {
  const: year =
  parseInt (document.getElementById('yearInput').value);
  const resultElement = Document.getElementByid('result');
  if (isNaN(year)) {
    resultElement.textContet = 'Пожалуйста, введите корректный код';
    return;
  }
const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 ===0);
if (isLeapYear) {
  resultElement.textContent = $ {year} - Это високосный год;
} else {

  resultElement.textContent = $ {year} - Это не високосный год;
}
})
  