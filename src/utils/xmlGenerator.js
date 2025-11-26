// Helper function to escape XML special characters
function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateMoodleXML(questions) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;

  questions.forEach(q => {
    if (!q.imageBase64) return;

    const questionName = q.idnumber;
    const moodleImgSrc = `@@PLUGINFILE@@/${q.generatedImageFileName}`;
    
    const fractionA = q.correctAnswer === 'A' ? '100' : '0';
    const fractionB = q.correctAnswer === 'B' ? '100' : '0';
    const fractionC = q.correctAnswer === 'C' ? '100' : '0';
    const fractionD = q.correctAnswer === 'D' ? '100' : '0';

    let questionTextHtml = "";
    if (q.mainTopic) questionTextHtml += `<p>Main Topic: ${escapeXml(q.mainTopic)}</p>`;
    if (q.subTopic1) questionTextHtml += `<p>Sub Topic 1: ${escapeXml(q.subTopic1)}</p>`;
    if (q.subTopic2 && q.subTopic2.trim()) {
      questionTextHtml += `<p>Sub Topic 2: ${escapeXml(q.subTopic2)}</p>`;
    }
    questionTextHtml += `<p><img src="${moodleImgSrc}" alt="Question ${q.idnumber}" width="auto" height="auto" style="max-width: 100%;"></p>`;

    xml += `  <question type="multichoice">\n`;
    xml += `    <name><text>${questionName}</text></name>\n`;
    xml += `    <questiontext format="html">\n`;
    xml += `      <text><![CDATA[${questionTextHtml}]]></text>\n`;
    xml += `      <file name="${q.generatedImageFileName}" path="/" encoding="base64">${q.imageBase64}</file>\n`;
    xml += `    </questiontext>\n`;
    xml += `    <generalfeedback format="html"><text></text></generalfeedback>\n`;
    xml += `    <defaultgrade>1.0000000</defaultgrade>\n`;
    xml += `    <penalty>0.3333333</penalty>\n`;
    xml += `    <hidden>0</hidden>\n`;
    xml += `    <idnumber>${q.idnumber}</idnumber>\n`;
    
    xml += `    <tags>\n`;
    if (q.week) xml += `      <tag><text>Week_${q.week}</text></tag>\n`;
    if (q.year) xml += `      <tag><text>Year_${q.year}</text></tag>\n`;
    if (q.paper) {
      const paperNumber = q.paper.replace(/Paper\s*/i, '').trim();
      xml += `      <tag><text>Paper_${paperNumber}</text></tag>\n`;
    }
    if (q.mainTopic) xml += `      <tag><text>MainTopic_${q.mainTopic.replace(/\s+/g, '_')}</text></tag>\n`;
    if (q.subTopic1) xml += `      <tag><text>SubTopic_${q.subTopic1.replace(/\s+/g, '_')}</text></tag>\n`;
    if (q.subTopic2 && q.subTopic2.trim()) {
      xml += `      <tag><text>SubTopic_${q.subTopic2.replace(/\s+/g, '_')}</text></tag>\n`;
    }
    xml += `    </tags>\n`;

    xml += `    <single>true</single>\n`;
    xml += `    <shuffleanswers>false</shuffleanswers>\n`;
    xml += `    <answernumbering>ABCD</answernumbering>\n`;
    xml += `    <showstandardinstruction>0</showstandardinstruction>\n`;
    xml += `    <correctfeedback format="html"><text>Correct!</text></correctfeedback>\n`;
    xml += `    <partiallycorrectfeedback format="html"><text>Partially correct.</text></partiallycorrectfeedback>\n`;
    xml += `    <incorrectfeedback format="html"><text>Incorrect.</text></incorrectfeedback>\n`;
    xml += `    <shownumcorrect/>\n`;
    xml += `    <answer fraction="${fractionA}" format="html">\n      <text>A</text>\n      <feedback format="html"><text></text></feedback>\n    </answer>\n`;
    xml += `    <answer fraction="${fractionB}" format="html">\n      <text>B</text>\n      <feedback format="html"><text></text></feedback>\n    </answer>\n`;
    xml += `    <answer fraction="${fractionC}" format="html">\n      <text>C</text>\n      <feedback format="html"><text></text></feedback>\n    </answer>\n`;
    xml += `    <answer fraction="${fractionD}" format="html">\n      <text>D</text>\n      <feedback format="html"><text></text></feedback>\n    </answer>\n`;
    xml += `  </question>\n`;
  });

  xml += `</quiz>\n`;
  return xml;
}
