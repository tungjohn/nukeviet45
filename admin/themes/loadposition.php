<?php

/**
 * NukeViet Content Management System
 * @version 4.x
 * @author VINADES.,JSC <contact@vinades.vn>
 * @copyright (C) 2009-2021 VINADES.,JSC. All rights reserved
 * @license GNU/GPL version 2 or any later version
 * @see https://github.com/nukeviet The NukeViet CMS GitHub project
 */

if (!defined('NV_IS_FILE_THEMES')) {
    exit('Stop!!!');
}

$theme1 = $nv_Request->get_title('theme1', 'get');
$theme2 = $nv_Request->get_title('theme2', 'get');
$contents = '';

if (preg_match($global_config['check_theme'], $theme1) and preg_match($global_config['check_theme'], $theme2) and $theme1 != $theme2 and file_exists(NV_ROOTDIR . '/themes/' . $theme1 . '/config.ini') and file_exists(NV_ROOTDIR . '/themes/' . $theme2 . '/config.ini')) {
    // Theme nguồn
    $position1 = array_column(nv_get_blocks($theme1, false), 'tag');

    // Theme đích
    $positions = nv_get_blocks($theme2, false);
    $position2 = array_column($positions, 'tag');

    $xtpl = new XTemplate('loadposition.tpl', NV_ROOTDIR . '/themes/' . $global_config['module_theme'] . '/modules/' . $module_file);
    $xtpl->assign('LANG', $lang_module);
    $xtpl->assign('GLANG', $lang_global);

    $position_intersect = array_intersect($position1, $position2);
    foreach ($positions as $position) {
        if (!in_array($position['tag'], $position_intersect, true)) {
            continue;
        }

        $xtpl->assign('NAME', $position['name']);
        $xtpl->assign('VALUE', $position['tag']);

        $xtpl->parse('main.loop');
    }

    $xtpl->parse('main');
    $contents = $xtpl->text('main');
}

include NV_ROOTDIR . '/includes/header.php';
echo $contents;
include NV_ROOTDIR . '/includes/footer.php';
