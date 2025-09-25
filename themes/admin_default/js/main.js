/**
 * NukeViet Content Management System
 * @version 4.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2021 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

var myTimerPage = '';
var myTimersecField = '';

function timeoutsesscancel() {
    clearInterval(myTimersecField);
    $.ajax({
        url: nv_base_siteurl + 'index.php?second=statimg',
        cache: false
    }).done(function() {
        $("#timeoutsess").hide();
        load_notification = 1;
        myTimerPage = setTimeout(function() {
            timeoutsessrun();
        }, nv_check_pass_mstime);
        if (typeof nv_get_notification === "function") {
            nv_get_notification();
        }
    });
}

function timeoutsessrun() {
    clearInterval(myTimerPage);
    var Timeout = 60;
    document.getElementById('secField').innerHTML = Timeout;
    $("#timeoutsess").show();
    var msBegin = new Date().getTime();
    myTimersecField = setInterval(function() {
        load_notification = 0;
        var msCurrent = new Date().getTime();
        var ms = Timeout - Math.round((msCurrent - msBegin) / 1000);
        if (ms >= 0) {
            document.getElementById('secField').innerHTML = ms;
        } else {
            clearInterval(myTimersecField);
            $("#timeoutsess").hide();
            $.getJSON(nv_base_siteurl + "index.php", {
                second: "time_login",
                nocache: (new Date).getTime()
            }).done(function(json) {
                if (json.showtimeoutsess == 1) {
                    $.get(nv_base_siteurl + "index.php?second=admin_logout&js=1&system=1&nocache=" + (new Date).getTime(), function() {
                        window.location.reload();
                    });
                } else {
                    myTimerPage = setTimeout(function() {
                        timeoutsessrun();
                    }, json.check_pass_time);
                }
            });
        }
    }, 1000);
}

// ModalShow
function modalShow(a, b, callback) {
    "" == a && (a = "&nbsp;");
    $("#sitemodal").find(".modal-title").html(a);
    $("#sitemodal").find(".modal-body").html(b);
    $("#sitemodal").modal();
    $('#sitemodal').on('shown.bs.modal', function(e) {
        if (typeof callback === "function") {
            callback(this);
            $(e.currentTarget).unbind('shown');
        };
    });
}

// locationReplace
function locationReplace(url) {
    var uri = window.location.href.substring(window.location.protocol.length + window.location.hostname.length + 2);
    if (url != uri && history.pushState) {
        history.pushState(null, null, url)
    }
}

function formXSSsanitize(form) {
    $(form).find("input, textarea").not(":submit, :reset, :image, :file, :disabled").not('[data-sanitize-ignore]').each(function() {
        $(this).val(DOMPurify.sanitize($(this).val(), {ALLOWED_TAGS: nv_whitelisted_tags, ADD_ATTR: nv_whitelisted_attr}));
    });
}

var NV = {
    menuBusy: false,
    menuTimer: null,
    menu: null,
    openMenu: function(menu) {
        this.menuBusy = true;
        this.menu = $(menu);
        this.menuTimer = setTimeout(function() {
            NV.menu.addClass('open');
        }, 300);
    },
    closeMenu: function(menu) {
        clearTimeout(this.menuTimer);
        this.menuBusy = false;
        this.menu = $(menu).removeClass('open');
    },
    fixContentHeight: function() {
        var wrap = $('.nvwrap');
        var vmenu = $('#left-menu');

        if (wrap.length > 0) {
            wrap.css('min-height', '100%');
            if (wrap.height() < vmenu.height() + vmenu.offset().top && vmenu.is(':visible')) {
                wrap.css('min-height', (vmenu.height() + vmenu.offset().top) + 'px')
            }
        }
    }
};

$(document).ready(function() {
    // Control content height
    NV.fixContentHeight();
    $(window).resize(function() {
        NV.fixContentHeight();
    });

    $('a[href^="http"]').not('a[href*="' + location.hostname + '"]').not('[rel*=dofollow]').attr({
        target: "_blank"
    });


    // Show submenu
    $('#menu-horizontal .dropdown, #left-menu .dropdown:not(.active)').hover(function() {
        NV.openMenu(this);
    }, function() {
        NV.closeMenu(this);
    });

    // Left menu handle
    $('#left-menu-toggle').click(function() {
        if ($('#left-menu').is(':visible')) {
            $('#left-menu, #left-menu-bg, #container, #footer').removeClass('open');
        } else {
            $('#left-menu, #left-menu-bg, #container, #footer').addClass('open');
        }
        NV.fixContentHeight();
    });

    // Show admin confirm
    myTimerPage = setTimeout(function() {
        timeoutsessrun();
    }, nv_check_pass_mstime);

    // Show confirm message on leave, reload page
    $('form.confirm-reload').change(function() {
        $(window).bind('beforeunload', function() {
            return nv_msgbeforeunload;
        });
    });

    // Disable confirm message on submit form
    $('form').submit(function() {
        $(window).unbind();
    });

    $('a[href="#"]').on('click', function(e) {
        e.preventDefault();
    });

    $('[data-btn="toggleLang"]').on('click', function(e) {
        e.preventDefault();
        $('.menu-lang').toggleClass('menu-lang-show');
    });

    //Change Localtion
    $("[data-location]").on("click", function() {
        locationReplace($(this).data("location"))
    });

    // XSSsanitize
    $('body').on('click', '[type=submit]:not([name],.ck-button-save)', function(e) {
        var form = $(this).parents('form');
        if (XSSsanitize && !$('[name=submit]', form).length) {
            // Khi không xử lý XSS thì trình submit mặc định sẽ thực hiện
            e.preventDefault();

            // Đưa CKEditor 5 trình soạn thảo vào textarea trước khi submit
            $(form).find("textarea").each(function() {
                if (this.dataset.editorname && window.nveditor && window.nveditor[this.dataset.editorname]) {
                    $(this).val(window.nveditor[this.dataset.editorname].getData());
                }
            });

            formXSSsanitize(form);
            $(form).submit();
        }
    });

    $(document).on('click', function(e) {
        if (
            $('[data-btn="toggleLang"]').is(':visible') &&
            !$(e.target).closest('.menu-lang').length &&
            !$(e.target).closest('[data-btn="toggleLang"]').length &&
            !$(e.target).closest('.dropdown-backdrop').length
        ) {
            $('.menu-lang').removeClass('menu-lang-show');
        }
    });

    // Bootstrap tooltip
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body'
    });

    // Cố định header bảng
    function stickyTable() {
        if ($('table.table:not(.table-sticky)').length > 1) {
            return;
        }
        let offset = 0;
        $('table.table').each(function() {
            let ctn = $(this).parent();
            if ((offset++ == 0 && ($(this).closest('form').length == 1 || ctn.is('.table-responsive')) && $('thead', $(this)).length > 0) || $(this).is('.table-sticky')) {
                var allowed;
                if (ctn.is('.table-responsive')) {
                    allowed = !(ctn[0].scrollWidth > ctn[0].clientWidth );
                } else {
                    allowed = true;
                }
                if (allowed) {
                    $(this).stickyTableHeaders({
                        cacheHeaderHeight: true
                    });
                } else {
                    $(this).stickyTableHeaders('destroy');
                }
            }
        });
    }
    stickyTable();
    let timerstickyTable;
    $(window).on('resize', function() {
        clearTimeout(timerstickyTable);
        timerstickyTable = setTimeout(() => {
            stickyTable();
        }, 210);
    });

    // Xử lý Ckeditor 5 bị tràn nếu đặt trong bảng
    $('[data-toggle="outerNvCkeditor5"]').each(function() {
        let tbl = $(this).closest('table');
        if (tbl.length) {
            tbl.css({
                'table-layout': 'fixed'
            });
        }
    });
});
