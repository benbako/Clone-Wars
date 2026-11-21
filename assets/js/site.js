(function () {
  'use strict';

  var doc = document.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLabel = document.querySelector('[data-nav-label]');
  var main = document.querySelector('main');
  var footer = document.querySelector('.site-footer');

  if (navToggle) {
    var setInert = function (state) {
      if (main) main.inert = state;
      if (footer) footer.inert = state;
    };

    var closeNav = function (returnFocus) {
      if (!document.body.classList.contains('nav-open')) return;
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      if (navLabel) navLabel.textContent = 'Menu';
      setInert(false);
      if (returnFocus) navToggle.focus();
    };

    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
      if (navLabel) navLabel.textContent = open ? 'Close' : 'Menu';
      setInert(open);
      if (open) {
        var firstLink = document.querySelector('.site-menu a');
        if (firstLink) firstLink.focus();
      }
    });

    document.querySelectorAll('.site-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav(true);
    });

    var desktop = window.matchMedia('(min-width: 901px)');
    var onBreakpoint = function (event) {
      if (event.matches) closeNav(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* -------------------------------------------------------
     Scroll-responsive background
     From alabaster (space) toward a deeper earth tone (philosophy)
     ------------------------------------------------------- */
  var pageBg = document.querySelector('.page-bg');
  var from = [247, 245, 240];
  var to = [233, 231, 224];
  var ticking = false;

  var updateBackground = function () {
    ticking = false;
    if (!pageBg || document.body.classList.contains('contact-complete')) return;
    var max = doc.scrollHeight - window.innerHeight;
    var progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    var t = Math.min(1, progress / 0.65);
    var rgb = from.map(function (channel, index) {
      return Math.round(channel + (to[index] - channel) * t);
    });
    doc.style.setProperty('--page-bg', 'rgb(' + rgb.join(', ') + ')');
  };

  var onScroll = function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateBackground);
    }
  };

  if (pageBg) {
    updateBackground();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* -------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------- */
  var revealItems = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !prefersReduced) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* -------------------------------------------------------
     Horizontal project gallery
     ------------------------------------------------------- */
  var scroller = document.querySelector('[data-scroller]');
  var prev = document.querySelector('[data-scroll-prev]');
  var next = document.querySelector('[data-scroll-next]');

  if (scroller && prev && next) {
    var step = function () {
      var card = scroller.querySelector('.project-card');
      var styles = window.getComputedStyle(scroller);
      var gap = parseFloat(styles.columnGap || styles.gap) || 24;
      return card ? card.getBoundingClientRect().width + gap : scroller.clientWidth * 0.8;
    };

    var updateButtons = function () {
      var styles = window.getComputedStyle(scroller);
      var padding = parseFloat(styles.paddingLeft) || 0;
      var max = scroller.scrollWidth - scroller.clientWidth - 2;
      prev.disabled = scroller.scrollLeft <= padding + 2;
      next.disabled = scroller.scrollLeft >= max;
    };

    prev.addEventListener('click', function () {
      scroller.scrollBy({ left: -step(), behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    next.addEventListener('click', function () {
      scroller.scrollBy({ left: step(), behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    scroller.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  }

  /* -------------------------------------------------------
     Cursor-follow image for the journal index
     ------------------------------------------------------- */
  var cursor = document.querySelector('.cursor-image');
  var cursorImage = cursor ? cursor.querySelector('img') : null;

  if (cursor && cursorImage && !prefersReduced) {
    var frame = null;
    var pointerX = 0;
    var pointerY = 0;

    document.querySelectorAll('[data-cursor-image]').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var source = row.getAttribute('data-cursor-image');
        if (!source) return;
        cursorImage.src = source;
        cursor.classList.add('is-active');
      });

      row.addEventListener('mouseleave', function () {
        cursor.classList.remove('is-active');
      });

      row.addEventListener('mousemove', function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) {
          frame = window.requestAnimationFrame(function () {
            cursor.style.left = pointerX + 'px';
            cursor.style.top = pointerY + 'px';
            frame = null;
          });
        }
      });
    });
  }

  /* -------------------------------------------------------
     Reading progress
     ------------------------------------------------------- */
  var progressBar = document.querySelector('[data-reading-progress]');
  var essayBody = document.querySelector('.essay-body');

  if (progressBar && essayBody) {
    var updateProgress = function () {
      var rect = essayBody.getBoundingClientRect();
      var total = essayBody.offsetHeight - window.innerHeight * 0.4;
      var read = Math.min(Math.max(-rect.top + window.innerHeight * 0.3, 0), Math.max(total, 0));
      progressBar.style.width = total > 0 ? (read / total) * 100 + '%' : '0%';
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* -------------------------------------------------------
     Inquiry form
     ------------------------------------------------------- */
  var form = document.querySelector('[data-contact-form]');

  if (form) {
    var panel = document.querySelector('[data-contact-success]');
    var status = form.querySelector('[data-form-status]');
    var fields = {
      name: form.querySelector('#name'),
      email: form.querySelector('#email'),
      message: form.querySelector('#message')
    };

    var setError = function (field, message) {
      var error = form.querySelector('[data-error-for="' + field.id + '"]');
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (error) {
          error.textContent = message;
          error.hidden = false;
        }
      } else {
        field.removeAttribute('aria-invalid');
        if (error) {
          error.textContent = '';
          error.hidden = true;
        }
      }
    };

    var validate = function () {
      var firstInvalid = null;

      if (!fields.name.value.trim()) {
        setError(fields.name, 'Please tell us your name.');
        firstInvalid = firstInvalid || fields.name;
      } else {
        setError(fields.name, '');
      }

      var email = fields.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setError(fields.email, 'Please enter a valid email address.');
        firstInvalid = firstInvalid || fields.email;
      } else {
        setError(fields.email, '');
      }

      if (fields.message.value.trim().length < 10) {
        setError(fields.message, 'A sentence or two is enough — just ten characters or more.');
        firstInvalid = firstInvalid || fields.message;
      } else {
        setError(fields.message, '');
      }

      return firstInvalid;
    };

    var showSuccess = function () {
      if (status) status.textContent = '';
      document.body.classList.add('contact-complete');
      if (panel) {
        panel.classList.add('is-active');
        panel.setAttribute('aria-hidden', 'false');
        var heading = panel.querySelector('h2');
        if (heading) heading.focus();
      }
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = validate();
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var action = form.getAttribute('action');
      if (action) {
        fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        }).then(function (response) {
          if (!response.ok) throw new Error('Request failed');
          showSuccess();
        }).catch(function () {
          if (status) status.textContent = 'Something went wrong. Please email studio@sylvansynergy.com instead.';
        });
      } else {
        showSuccess();
      }
    });

    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener('input', function () {
        setError(fields[key], '');
      });
    });

    var resetButton = document.querySelector('[data-contact-reset]');
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        document.body.classList.remove('contact-complete');
        if (panel) {
          panel.classList.remove('is-active');
          panel.setAttribute('aria-hidden', 'true');
        }
        form.reset();
        if (fields.name) fields.name.focus();
      });
    }
  }
})();
