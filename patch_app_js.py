import re

with open('js/app.js', 'r') as f:
    content = f.read()

drawer_methods = """
        // Game Settings Drawer Logic
        window.openGameDrawer = (event) => {
            document.getElementById('game-drawer-id').value = event.id;
            document.getElementById('game-drawer-title').textContent = event.title || 'Game Settings';

            // Populate fields
            document.getElementById('game-drawer-icon').value = event.iconUrl || '';
            document.getElementById('game-drawer-banner').value = event.bannerUrl || '';

            // Format datetime-local (YYYY-MM-DDTHH:MM:SS) if exists
            let launchDate = '';
            if (event.officialLaunchDate) {
                try {
                    launchDate = event.officialLaunchDate.replace(' ', 'T');
                } catch(e){}
            }
            document.getElementById('game-drawer-launch').value = launchDate;

            // Show drawer
            const overlay = document.getElementById('game-drawer-overlay');
            const drawer = document.getElementById('game-drawer');
            overlay.classList.remove('hidden');
            // small delay for transition
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                drawer.classList.remove('translate-x-full');
            }, 10);
        };

        window.closeGameDrawer = () => {
            const overlay = document.getElementById('game-drawer-overlay');
            const drawer = document.getElementById('game-drawer');

            overlay.classList.add('opacity-0');
            drawer.classList.add('translate-x-full');

            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        };

        window.saveGameDrawer = async () => {
            const id = document.getElementById('game-drawer-id').value;
            const iconUrl = document.getElementById('game-drawer-icon').value.trim();
            const bannerUrl = document.getElementById('game-drawer-banner').value.trim();
            const launchInput = document.getElementById('game-drawer-launch').value;

            let officialLaunchDate = '';
            if(launchInput) {
                officialLaunchDate = launchInput.replace('T', ' ');
            }

            try {
                const db = window.firebase.firestore();
                await db.collection('events_v2').doc(id).update({
                    iconUrl: iconUrl,
                    bannerUrl: bannerUrl,
                    officialLaunchDate: officialLaunchDate
                });

                window.showToast('Game Settings updated successfully!', 'success');
                window.closeGameDrawer();

                // Re-render cards to show updated images
                if (window.location.hash === '#/new-games') {
                    setTimeout(() => window.renderGameCards(), 100);
                }
            } catch (error) {
                console.error("Error saving game settings:", error);
                window.showToast('Error saving game settings.', 'error');
            }
        };
"""
# Find a good place to insert (like after renderGameCards)
# Look for a closing bracket for renderGameCards and add it after
content = re.sub(r'(window\.renderGameCards = \(\) => \{[\s\S]*?\n        \};)', r'\1\n' + drawer_methods, content)


with open('js/app.js', 'w') as f:
    f.write(content)
