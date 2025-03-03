import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

const undefinedAnswer = 'undefined';
const answerWithEmptyResult = {
  value: '',
  result: '',
  name: 'answerWithEmptyResult',
};
const answerWithUndefinedResult = {
  value: '',
  result: undefined,
  name: 'answerWithUndefinedResult',
};
const answerWithNullResult = {
  value: '',
  result: null,
  name: 'answerWithNullResult',
};
const answerWithOkResult = {
  value: '',
  result: 'ok'
};
const answerWithRandomResult = {
  value: '',
  result: 'RANDOM_RESULT'
};

describe('Unit | Component | result-item-component', function() {

  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:result-item');
  });

  describe('#resultItem Computed property - undefined case', function() {
    [
      undefinedAnswer,
      answerWithEmptyResult,
      answerWithUndefinedResult,
      answerWithNullResult
    ].forEach(function(answer) {
      it(`should returns false when answer provided is: ${answer.name}`, function() {
        // when
        component.set('answer', answer);
        // then
        expect(component.get('resultItem')).to.be.undefined;
      });
    });

  });

  describe('#resultItem Computed property - defined case', function() {
    it('should returns true when answer provided with result ok', function() {
      // when
      component.set('answer', answerWithOkResult);
      // then
      expect(component.get('resultItem.tooltip')).to.equal('Réponse correcte');
    });

    it('should returns true when answer provided with result uncommon value by not null or undefined ', function() {
      // when
      component.set('answer', answerWithRandomResult);
      // then
      expect(component.get('resultItem.tooltip')).to.equal('Correction automatique en cours de développement ;)');
    });
  });

  describe('#validationImplementedForChallengeType', function() {

    [
      { challengeType: 'QCM', expected: true },
      { challengeType: 'QROC', expected: true },
      { challengeType: 'QROCm-ind', expected: false },
      { challengeType: 'QROCm-dep', expected: false },
      { challengeType: 'QCU', expected: true }
    ].forEach(function(data) {

      it(`should return ${data.expected} when challenge type is ${data.challengeType}`, function() {
        // given
        const challenge = EmberObject.create({ type: data.challengeType });
        const answer = EmberObject.create({ challenge });

        // when
        component.set('answer', answer);

        // then
        expect(component.get('validationImplementedForChallengeType')).to.equal(data.expected);
      });
    });

  });

});
