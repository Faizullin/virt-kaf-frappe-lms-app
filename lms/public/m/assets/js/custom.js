(function ($) {
	"use strict";

	$('.owl-carousel').owlCarousel({
		loop: true,
		margin: 30,
		nav: true,
		pagination: true,
		responsive: {
			0: { items: 1 },
			600: { items: 1 },
			1000: { items: 2 }
		}
	});

	$(window).scroll(function () {
		var scroll = $(window).scrollTop();
		var box = $('.header-text').height();
		var header = $('header').height();

		if (scroll >= box - header) {
			$("header").addClass("background-header");
		} else {
			$("header").removeClass("background-header");
		}
	});

	mobileNav();

	window.sr = new scrollReveal();

	if ($('.menu-trigger').length) {
		$(".menu-trigger").on('click', function () {
			$(this).toggleClass('active');
			$('.header-area .nav').slideToggle(200);
		});
	}

	$('a[href*=\\#]:not([href=\\#])').on('click', function () {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var targetHash = this.hash;
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				var width = $(window).width();
				if (width < 991) {
					$('.menu-trigger').removeClass('active');
					$('.header-area .nav').slideUp(200);
				}
				$('html,body').animate({
					scrollTop: (target.offset().top)
				}, 700, 'swing', function () {
					window.location.hash = targetHash;
				});
				return false;
			}
		}
	});

	$(document).ready(function () {
		const currentPathname = window.my_data.pathname;
		const urls_data = {
			"index": "/",
			"about": "/about",
			"articles": "/articles",
		};

		const currentUrl = urls_data[currentPathname];
		if (!currentUrl) {
			console.warn(`currentPathname ${currentPathname} not found in urls_data.`);
		} else {
		}

		$('.menu-item').each(function () {
			const href = $(this).attr("href");
			if (!href.startsWith("#") && $(this).data("url-name") === currentPathname) {
				$(this).addClass("active");
			}
		});

		$('.menu-item[href*="#"]').on('click', function (e) {
			const href = $(this).attr("href");
			const hashIndex = href.indexOf("#");
			if (hashIndex === -1) return;

			const hash = href.substring(hashIndex);
			console.log("hast", hash)
			

			const target = $(hash);
			if (!target.length) {
				window.location.href = "/" + hash;
			}
		});

		// // Smooth scroll for hash links
		// $('.menu-item[href*="#"]').on('click', function (e) {
		// 	const href = $(this).attr("href");
		// 	const hashIndex = href.indexOf("#");
		// 	if (hashIndex === -1) return;

		// 	const hash = href.substring(hashIndex);
		// 	const target = $(hash);
		// 	if (target.length) {
		// 		e.preventDefault();
		// 		$('html, body').stop().animate({
		// 			scrollTop: target.offset().top
		// 		}, 500, 'swing', function () {
		// 			window.location.hash = hash;
		// 			$('.menu-item').removeClass('active');
		// 			$(`.menu-item[href*="${hash}"]`).addClass('active');
		// 		});
		// 	}
		// });


	});

	const Accordion = {
		settings: {
			first_expanded: false,
			toggle: false
		},

		openAccordion: function (toggle, content) {
			if (content.children.length) {
				toggle.classList.add("is-open");
				let final_height = Math.floor(content.children[0].offsetHeight);
				content.style.height = final_height + "px";
			}
		},

		closeAccordion: function (toggle, content) {
			toggle.classList.remove("is-open");
			content.style.height = 0;
		},

		init: function (el) {
			const _this = this;
			let is_first_expanded = _this.settings.first_expanded;
			if (el.classList.contains("is-first-expanded")) is_first_expanded = true;
			let is_toggle = _this.settings.toggle;
			if (el.classList.contains("is-toggle")) is_toggle = true;

			const sections = el.getElementsByClassName("accordion");
			const all_toggles = el.getElementsByClassName("accordion-head");
			const all_contents = el.getElementsByClassName("accordion-body");

			for (let i = 0; i < sections.length; i++) {
				const toggle = all_toggles[i];
				const content = all_contents[i];

				toggle.addEventListener("click", function () {
					if (!is_toggle) {
						for (let a = 0; a < all_contents.length; a++) {
							_this.closeAccordion(all_toggles[a], all_contents[a]);
						}
						_this.openAccordion(toggle, content);
					} else {
						if (toggle.classList.contains("is-open")) {
							_this.closeAccordion(toggle, content);
						} else {
							_this.openAccordion(toggle, content);
						}
					}
				});

				if (i === 0 && is_first_expanded) {
					_this.openAccordion(toggle, content);
				}
			}
		}
	};

	(function () {
		const accordions = document.getElementsByClassName("accordions");
		for (let i = 0; i < accordions.length; i++) {
			Accordion.init(accordions[i]);
		}
	})();

	if ($('.home-seperator').length) {
		$('.home-seperator .left-item, .home-seperator .right-item').imgfix();
	}

	if ($('.count-item').length) {
		$('.count-item strong').counterUp({
			delay: 10,
			time: 1000
		});
	}

	$(window).on('load', function () {
		if ($('.cover').length) {
			$('.cover').parallax({
				imageSrc: $('.cover').data('image'),
				zIndex: '1'
			});
		}

		$("#preloader").animate({ 'opacity': '0' }, 600, function () {
			setTimeout(function () {
				$("#preloader").css("visibility", "hidden").fadeOut();
			}, 300);
		});
	});

	$(window).on('resize', function () {
		mobileNav();
	});

	function mobileNav() {
		var width = $(window).width();
		$('.submenu').on('click', function () {
			if (width < 992) {
				$('.submenu ul').removeClass('active');
				$(this).find('ul').toggleClass('active');
			}
		});
	}

})(window.jQuery);
