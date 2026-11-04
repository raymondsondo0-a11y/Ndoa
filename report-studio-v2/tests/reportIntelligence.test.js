import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseReferenceDocuments } from '../src/reportIntelligence.js';

test('detects common industrial training report sections', () => {
  const result = analyseReferenceDocuments([{
    name: 'sample.docx',
    text: [
      'DECLARATION',
      'ACKNOWLEDGEMENT',
      'ABSTRACT',
      'TABLE OF CONTENTS',
      'CHAPTER ONE: INTRODUCTION',
      'Background of the Organization',
      'Objectives of the Training',
      'CHAPTER TWO: LITERATURE REVIEW',
      'CHAPTER THREE: ACTIVITIES PERFORMED',
      'Tools and Equipment',
      'CHAPTER FOUR: RESULTS AND DISCUSSION',
      'CHAPTER FIVE: CONCLUSION AND RECOMMENDATIONS',
      'REFERENCES',
      'APPENDICES'
    ].join('\n')
  }]);

  const titles = result.headings.map(item => item.title.toLowerCase());
  assert.ok(titles.some(title => title.includes('declaration')));
  assert.ok(titles.some(title => title.includes('chapter one')));
  assert.ok(titles.some(title => title.includes('references')));
  assert.ok(result.recommendedOutline.length >= 6);
});

test('returns an empty but valid analysis for an empty input list', () => {
  const result = analyseReferenceDocuments([]);
  assert.equal(result.documentCount, 0);
  assert.equal(result.headings.length, 0);
  assert.ok(Array.isArray(result.recommendedOutline));
});
