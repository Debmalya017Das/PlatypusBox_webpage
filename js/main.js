"use strict";
// Initiate the wowjs
if (typeof WOW !== 'undefined') {
    new WOW().init();
}

// Sticky Navbar
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 45) {
        navbar.classList.add('sticky-top', 'shadow-sm');
    } else {
        navbar.classList.remove('sticky-top', 'shadow-sm');
    }
});

// Back to top button
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        backToTopButton.style.display = 'block';
        backToTopButton.style.opacity = '1';
    } else {
        backToTopButton.style.opacity = '0';
        setTimeout(() => {
            backToTopButton.style.display = 'none';
        }, 300); // Adjust timing to match your CSS transition
    }
});

backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


class CounterUp {
  constructor(options) {
    const defaults = {
      time: 400,
      delay: 10,
      offset: 100,
      beginAt: 0,
      formatter: false,
      context: window,
      callback: () => {}
    };

    this.settings = { ...defaults, ...options };
    this.init();
  }

  init() {
    const counters = document.querySelectorAll('[data-counterup]');

    counters.forEach(counter => {
      const counterData = {
        time: parseInt(counter.dataset.counterupTime) || this.settings.time,
        delay: parseInt(counter.dataset.counterupDelay) || this.settings.delay,
        offset: parseInt(counter.dataset.counterupOffset) || this.settings.offset,
        beginAt: parseInt(counter.dataset.counterupBeginat) || this.settings.beginAt,
        context: counter.dataset.counterupContext || this.settings.context
      };

      this.createObserver(counter, counterData);
    });
  }

  createObserver(counter, counterData) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startCounter(counter, counterData);
          observer.unobserve(counter);
        }
      });
    }, {
      root: counterData.context === 'window' ? null : document.querySelector(counterData.context),
      threshold: counterData.offset / 100
    });

    observer.observe(counter);
  }

  startCounter(counter, counterData) {
    const divisions = counterData.time / counterData.delay;
    let num = counter.getAttribute('data-num') || counter.textContent;
    const isComma = /[0-9]+,[0-9]+/.test(num);
    num = num.replace(/,/g, '');
    const decimalPlaces = (num.split('.')[1] || []).length;

    if (counterData.beginAt > num) counterData.beginAt = num;

    const isTime = /[0-9]+:[0-9]+:[0-9]+/.test(num);
    let s = 0;

    if (isTime) {
      const times = num.split(':');
      let m = 1;
      while (times.length > 0) {
        s += m * parseInt(times.pop(), 10);
        m *= 60;
      }
    }

    const nums = [];
    for (let i = divisions; i >= counterData.beginAt / num * divisions; i--) {
      let newNum = (num / divisions * i).toFixed(decimalPlaces);

      if (isTime) {
        newNum = parseInt(s / divisions * i);
        const hours = String(parseInt(newNum / 3600) % 24).padStart(2, '0');
        const minutes = String(parseInt(newNum / 60) % 60).padStart(2, '0');
        const seconds = String(parseInt(newNum % 60, 10)).padStart(2, '0');
        newNum = `${hours}:${minutes}:${seconds}`;
      }

      if (isComma) {
        newNum = newNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      if (this.settings.formatter) {
        newNum = this.settings.formatter.call(counter, newNum);
      }

      nums.unshift(newNum);
    }

    counter.dataset.counterupNums = JSON.stringify(nums);
    counter.textContent = counterData.beginAt;

    const f = () => {
      const nums = JSON.parse(counter.dataset.counterupNums || '[]');

      if (nums.length) {
        counter.textContent = nums.shift();
        counter.dataset.counterupNums = JSON.stringify(nums);

        setTimeout(f, counterData.delay);
      } else {
        delete counter.dataset.counterupNums;
        this.settings.callback.call(counter);
      }
    };

    setTimeout(f, counterData.delay);
  }
}

// Usage:
document.addEventListener('DOMContentLoaded', () => {
  new CounterUp();
});
