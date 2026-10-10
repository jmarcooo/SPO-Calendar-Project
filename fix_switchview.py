import re

with open('index.html', 'r') as f:
    content = f.read()

# I need to ensure that when switchView is called with 'settings' and admin is true, renderAdminPOCSettings is called.

switchview_replace = """
            if (viewName === 'settings' && window.isAdminModeEnabled) {
                setTimeout(() => {
                    document.getElementById('admin-settings-section').style.display = 'block';
                    if(window.renderAdminPOCSettings) window.renderAdminPOCSettings();
                }, 100);
            }
"""

if "window.renderAdminPOCSettings()" not in content:
    old_switch = """            if (viewName === 'settings' && window.isAdminModeEnabled) {
                setTimeout(() => {
                    document.getElementById('admin-settings-section').style.display = 'block';
                }, 100);
            }"""

    content = content.replace(old_switch, switchview_replace)
    with open('index.html', 'w') as f:
        f.write(content)
    print("Updated switchView to call renderAdminPOCSettings")
else:
    print("Already updated switchView")
