const fs = require('fs');

const analyses = fs.readFileSync(process.argv[2], 'utf8')
                     .split('\n')
                     .filter(d => Boolean(d))
                     .map(raw => JSON.parse(raw))
                     .map(
                         ({sections, segments}) =>
                             alignSectionsAndSegments(sections, segments));

console.info('key_conf,t0,t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,duration');
for (const analysis of analyses) {
  for (const {keyConfidence, timbre, duration} of analysis) {
    console.info(`${keyConfidence},${timbre.join(',')},${duration}`);
  }
}

function alignSectionsAndSegments(sections, segments) {
  sections.sort((a, b) => a.start - b.start);
  segments.sort((a, b) => a.start - b.start);
  const alignedData = [];
  while (sections.length && segments.length) {
    const section = sections[0];
    const sectionStart = section.start;
    const sectionEnd = sectionStart + section.duration;
    const segment = segments[0];
    const segmentStart = segment.start;
    const segmentEnd = segmentStart + segment.duration;
    const alignedStart = Math.max(sectionStart, segmentStart);
    const alignedEnd = Math.min(sectionEnd, segmentEnd);
    alignedData.push({
      keyConfidence: section.key_confidence,
      modeConfidence: section.mode_confidence,
      timbre: segment.timbre || [],
      start: alignedStart,
      duration: alignedEnd - alignedStart,
    });
    if (sectionEnd <= segmentEnd) {
      sections.shift();
    }

    if (sectionEnd >= segmentEnd) {
      segments.shift();
    }
  }
  return alignedData;
}
