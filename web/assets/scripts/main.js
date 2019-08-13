// Generated by CoffeeScript 1.10.0
(function() {
  var clickS, drawObject, fastS, fps, initState, inputS, isPaused, lastClick, lastView, modelP, mousePos, orbit, orbitP, orbitS, pauseP, pauseS, resetS, resizeS, scale, scale2, screenSize, simSpeed, slowS, speedP, speedS, trailP, trailS, trails, updateObject, viewPort;

  fps = 60;

  isPaused = false;

  trails = false;

  orbit = true;

  simSpeed = 5120000;

  scale = 1263955670;

  scale2 = 10000000;

  mousePos = new Phys.Celestial(0, 0);

  viewPort = new Util.Vector2(0, 0);

  lastView = new Util.Vector2(0, 0);

  lastClick = new Util.Vector2(0, 0);

  screenSize = Util.sizeCanvas();

  viewPort = viewPort.add(screenSize.multiply(1 / 2));

  scale2 = Math.round(6.957e7 * 2 / screenSize.Y) * 1.1;

  updateObject = function(object, allObjects) {
    var acceleration;
    acceleration = Phys.totalGravityVector(object, allObjects).multiply(1 / fps).multiply(simSpeed);
    object.velocity = object.velocity.add(acceleration);
    object.xCoord -= (object.velocity.X / fps) * simSpeed;
    return object.yCoord -= (object.velocity.Y / fps) * simSpeed;
  };

  drawObject = function(object) {
    var canvasContext, s;
    canvasContext = $('#screen')[0].getContext('2d');
    s = orbit ? scale : scale2;
    return canvasContext.drawImage($(object.tex)[0], (object.xCoord / s) - (object.radius / s) + viewPort.X, (object.yCoord / s) - (object.radius / s) + viewPort.Y, (object.radius / s) * 2, (object.radius / s) * 2);
  };

  resizeS = $(window).asEventStream('resize');

  clickS = $('#screen').asEventStream('mousedown mouseup mousemove mousewheel');

  resetS = $('#reset').asEventStream('click').map('reset');

  pauseS = $('#pause').asEventStream('click');

  trailS = $('#trail').asEventStream('click');

  orbitS = $('#orbit').asEventStream('click');

  slowS = $('#slower').asEventStream('click').map(1 / 2);

  fastS = $('#faster').asEventStream('click').map(2);

  speedS = slowS.merge(fastS);

  inputS = new Bacon.Bus();

  inputS.plug(clickS.merge(resetS));

  resizeS.onValue(function() {
    return Util.sizeCanvas();
  });

  initState = function() {
    var earth, heimdallr, lich, quarter, s, sol;
    if (orbit) {
      quarter = scale * (screenSize.X / 4);
      lich = new Phys.Celestial('#LICH', -quarter, 0, 2.7846e30, 3e9, 'Lich', 0);
      heimdallr = new Phys.Celestial('#HEIM', -quarter, 4.4880e11, 2.0921e26, 1e10, 'Heimdallr', 0);
      sol = new Phys.Celestial('#SOL', quarter, 0, 1.989e30, 1e10, 'Sol', 1);
      earth = new Phys.Celestial('#POL', quarter, 1.496e11, 5.972e24, 3e9, 'Earth', 1);
      s = [lich, heimdallr, sol, earth];
      s[0].velocity = new Util.Vector2(0, 0);
      s[1].velocity = new Util.Vector2(20343.13599, 0);
      s[2].velocity = new Util.Vector2(0, 0);
      s[3].velocity = new Util.Vector2(29290, 0);
    } else {
      lich = new Phys.Celestial('#LICH', 0, 0, 2.7846e30, 1.0436e4, 'Lich');
      sol = new Phys.Celestial('#SOL', 0, 0, 1.989e30, 6.957e7, 'Sol');
      earth = new Phys.Celestial('#POL', 0, 0, 5.972e24, 6.371e6, 'Earth');
      heimdallr = new Phys.Celestial('#HEIM', 0, 0, 2.0921e26, 2.5484e7, 'Heimdallr');
      s = [sol, heimdallr, earth, lich];
    }
    return s;
  };

  modelP = inputS.scan(initState(), function(model, event) {
    var s, shift;
    if (typeof event === 'string') {
      if (event.slice(0, 7) === 'delete ') {
        return model.filter(function(x) {
          return x.UUID !== event.slice(7);
        });
      }
      if (event === 'reset') {
        Util.clear();
        return initState();
      }
    }
    if (event.type === 'mousedown') {
      if (event.which === 2) {
        lastView = viewPort;
        lastClick = new Util.Vector2(event.offsetX, event.offsetY);
        return model;
      } else {
        return model;
      }
    }
    if (event.type === 'mouseup' || event.type === 'mousemove') {
      if (event.which === 2) {
        shift = new Util.Vector2(event.offsetX - lastClick.X, event.offsetY - lastClick.Y);
        viewPort = lastView.add(shift);
        return model;
      } else {
        s = orbit ? scale : scale2;
        mousePos.xCoord = (event.offsetX - viewPort.X) * s;
        mousePos.yCoord = (event.offsetY - $('#navbar').height() - viewPort.Y) * s;
        return model;
      }
    }
    if (event.type === 'mousewheel') {
      if (event.originalEvent.wheelDelta > 0) {
        if (orbit) {
          scale = Math.round(scale * 0.9);
        } else {
          scale2 = Math.round(scale2 * 0.9);
        }
      } else {
        if (orbit) {
          scale = Math.round(scale * 1.1);
        } else {
          scale2 = Math.round(scale2 * 1.1);
        }
      }
      return model;
    }
  });

  pauseP = pauseS.map(1).scan(1, function(accumulator, value) {
    return accumulator + value;
  }).map(function(value) {
    return value % 2 === 0;
  });

  pauseP.onValue(function(newPause) {
    return isPaused = newPause;
  });

  pauseP.map(function(pause) {
    if (pause) {
      return 'Play';
    } else {
      return 'Pause';
    }
  }).assign($('#pause'), 'text');

  trailP = trailS.map(1).scan(1, function(accumulator, value) {
    return accumulator + value;
  }).map(function(value) {
    return value % 2 === 0;
  });

  trailP.onValue(function(newTrails) {
    return trails = newTrails;
  });

  trailP.map(function(trails) {
    if (trails) {
      return 'Trails Off';
    } else {
      return 'Trails On';
    }
  }).assign($('#trail'), 'text');

  orbitP = orbitS.map(1).scan(0, function(accumulator, value) {
    return accumulator + value;
  }).map(function(value) {
    return value % 2 === 0;
  });

  orbitP.onValue(function(newOrbit) {
    orbit = newOrbit;
    return inputS.push('reset');
  });

  orbitP.map(function(orbits) {
    if (orbit) {
      return 'Concentric';
    } else {
      return 'Orbit';
    }
  }).assign($('#orbit'), 'text');

  speedP = speedS.scan(simSpeed, function(accumulator, factor) {
    return Math.round(accumulator * factor);
  });

  speedP.onValue(function(newSpeed) {
    return simSpeed = newSpeed;
  });

  speedP.assign($('#speed'), 'text');

  modelP.sample(Util.ticksToMilliseconds(fps)).onValue(function(model) {
    var i, j, k, l, len, len1, len2, m, object, objectInfo, ref, results;
    if (orbit) {
      $('#scale').text('Scale: ' + scale);
    } else {
      $('#scale').text('Scale: ' + scale2);
    }
    if (!trails) {
      Util.clear();
    }
    for (i = 0, len = model.length; i < len; i++) {
      object = model[i];
      if (!isPaused && orbit) {
        updateObject(object, model);
      }
    }
    for (l = j = 0; j <= 1; l = ++j) {
      mousePos.layer = l;
      ref = Phys.checkCollisions(mousePos, model);
      for (k = 0, len1 = ref.length; k < len1; k++) {
        object = ref[k];
        console.log(object);
        objectInfo = 'UUID: ' + object.UUID + ';\t';
        if (orbit) {
          objectInfo += 'Velocity: (' + Math.round(object.velocity.X) + 'm/s , ' + Math.round(object.velocity.Y) + 'm/s );\t';
        } else {
          objectInfo += 'Mass: ' + object.mass + 'kg;\t';
          objectInfo += 'Radius: ' + object.radius + 'm;\t';
        }
        $('#objectInfo').text(objectInfo);
      }
    }
    results = [];
    for (m = 0, len2 = model.length; m < len2; m++) {
      object = model[m];
      results.push(drawObject(object));
    }
    return results;
  });

}).call(this);
