/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Events', function() {

  var adjustRelatedTarget = ShadowDOMPolyfill.adjustRelatedTarget;
  var unwrap = ShadowDOMPolyfill.unwrap;


  test('addEventListener', function() {
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    var calls = 0;
    function f(e) {
      calls++;
    }

    div1.addEventListener('click', f, true);
    div2.addEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(calls, 2);

    div1.removeEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(calls, 3);

    div2.removeEventListener('click', f, true);

    div1.click();
    div2.click();
    assert.equal(calls, 3);
  });

  test('removeEventListener', function() {
    var div = document.createElement('div');
    var calls = 0;
    function f(e) {
      calls++;
    }
    function g(e) {
      calls++;
    }

    div.addEventListener('click', f, true);
    div.addEventListener('click', g, true);

    div.click();
    assert.equal(calls, 2);

    div.removeEventListener('click', f, true);

    var event = document.createEvent('MouseEvent');
    var unwrappedEvent = unwrap(event);
    unwrappedEvent.initMouseEvent(
        'click',  // type
        true,  // canBubble
        true,  // cancelable
        window,  // view
        0,  // detail
        0,  // screenX
        0,  // screenY
        0,  // clientX
        0,  // clientY
        false,  // ctrlKey
        false,  // altKey
        false,  // shiftKey
        false,  // metaKey
        0,  // button
        null);  // relatedTarget
    unwrap(div).dispatchEvent(unwrappedEvent);
    assert.equal(calls, 3);
  });

  test('event', function() {
    var div = document.createElement('div');
    var calls = 0;
    var f;
    div.addEventListener('x', f = function(e) {
      calls++;
      assert.equal(this, div);
      assert.equal(e.target, div);
      assert.equal(e.currentTarget, div);
      assert.equal(e.type, 'x');
    }, false);
    var e = document.createEvent('Event');
    e.initEvent('x', true, true);
    div.dispatchEvent(e);
    assert.equal(calls, 1);

    div.removeEventListener('x', f, false);
    var e2 = document.createEvent('Event');
    e2.initEvent('x', true, true);
    div.dispatchEvent(e2);
    assert.equal(calls, 1);
  });

  test('mouse event', function() {
    var div = document.createElement('div');
    var called = false;
    div.addEventListener('click', function(e) {
      called = true;
      assert.equal(this, div);
      assert.equal(e.target, div);
      assert.equal(e.currentTarget, div);
      assert.equal(e.relatedTarget, null);
      assert.equal(e.type, 'click');
    }, false);
    div.click();
    assert.isTrue(called);
  });

  test('stopPropagation', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopPropagation();
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [a, Event.CAPTURING_PHASE, b, Event.CAPTURING_PHASE]);
  });

  test('stopPropagation during bubble', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopPropagation();
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [
      a, Event.CAPTURING_PHASE,
      b, Event.CAPTURING_PHASE,
      c, Event.AT_TARGET,
      c, Event.AT_TARGET,
      b, Event.BUBBLING_PHASE
    ]);
  });

  test('stopPropagation at target', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopPropagation();
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [
      a, Event.CAPTURING_PHASE,
      b, Event.CAPTURING_PHASE,
      c, Event.AT_TARGET,
      c, Event.AT_TARGET
    ]);
  });

  test('stopImmediatePropagation', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b><c>d</c></b>';
    var b = a.firstChild;
    var c = b.firstChild;

    var log = [];
    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    a.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
      e.stopImmediatePropagation();
    }, true);

    b.addEventListener('click', function(e) {
      log.push('FAIL', e.currentTarget, e.eventPhase);
    }, true);

    b.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, true);

    c.addEventListener('click', function(e) {
      log.push(e.currentTarget, e.eventPhase);
    }, false);

    c.click();
    assertArrayEqual(log, [a, Event.CAPTURING_PHASE, b, Event.CAPTURING_PHASE]);
  });

  test('click with shadow', function() {
    function addListener(target, currentTarget, opt_phase) {
      var phases;
      if (opt_phase === Event.AT_TARGET)
        phases = [opt_phase];
      else
        phases = [Event.CAPTURING_PHASE, Event.BUBBLING_PHASE];

      calls += phases.length;

      phases.forEach(function(phase) {
        var capture = phase === Event.CAPTURING_PHASE;
        currentTarget.addEventListener('click', function f(e) {
          calls--;
          assert.equal(e.eventPhase, phase);
          assert.equal(e.target, target);
          assert.equal(e.currentTarget, currentTarget);
          assert.equal(e.currentTarget, this);
          currentTarget.removeEventListener('click', f, capture);
        }, capture);
      });
    }

    var div = document.createElement('div');
    div.innerHTML = '<a><b></b></a>';
    var a = div.firstChild;
    var b = a.firstChild;
    var sr = div.createShadowRoot();
    sr.innerHTML = '<p><content></content></p>';
    var p = sr.firstChild;
    var content = p.firstChild;

    div.offsetWidth;  // trigger recalc

    var calls = 0;

    addListener(b, div);
    addListener(b, sr);
    addListener(b, p);
    addListener(b, content);
    addListener(b, a);
    addListener(b, b, Event.AT_TARGET);
    b.click();
    assert.equal(calls, 0);

    addListener(div, div);
    addListener(content, sr);
    addListener(content, p);
    addListener(content, content, Event.AT_TARGET);
    content.click();
    assert.equal(calls, 0);

    var sr2 = div.createShadowRoot();
    sr2.innerHTML = '<q><shadow></shadow></q>';
    var q = sr2.firstChild;
    var shadow = q.firstChild;

    div.offsetWidth;  // trigger recalc

    addListener(b, div);
    addListener(b, sr2);
    addListener(b, q);
    addListener(b, shadow);
    addListener(b, sr);
    addListener(b, p);
    addListener(b, content);
    addListener(b, a);
    addListener(b, b, Event.AT_TARGET);

    b.click();
    assert.equal(calls, 0);
  });

  test('adjustRelatedTarget', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a><b><c></c><d></d></b>';
    var a = div.firstChild;
    var b = div.lastChild;
    var c = b.firstChild;
    var d = b.lastChild;

    assert.equal(adjustRelatedTarget(c, d), d);

    var sr = b.createShadowRoot();
    sr.innerHTML = '<e></e><content></content><f></f>';
    var e = sr.firstChild;
    var content = e.nextSibling;
    var f = sr.lastChild;

    div.offsetWidth;  // trigger recalc

    assert.equal(adjustRelatedTarget(a, e), b);
    assert.equal(adjustRelatedTarget(e, f), f);
  });

});
