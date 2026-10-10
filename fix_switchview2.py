import re

with open('index.html', 'r') as f:
    content = f.read()

old_block = """                    } else if (viewName === 'settings') {
                        const adminSettings = document.getElementById('admin-settings-section');
                        if (adminSettings && window.isAdminModeEnabled) {
                            adminSettings.style.display = 'block';
                        }
                    }"""

new_block = """                    } else if (viewName === 'settings') {
                        const adminSettings = document.getElementById('admin-settings-section');
                        if (adminSettings && window.isAdminModeEnabled) {
                            adminSettings.style.display = 'block';
                            if (window.renderAdminPOCSettings) window.renderAdminPOCSettings();
                        }
                    }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('index.html', 'w') as f:
        f.write(content)
    print("Replaced settings switchView block")
else:
    print("Could not find the block to replace")
