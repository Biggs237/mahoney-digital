# How to Install and Use Composer on Windows (Manual Steps)

**Note for you (Jeremy):** The automated script failed because it couldn't download the PHP zip (likely network restrictions in this environment or firewall). We'll do it manually.

Your current Mahoney Digital project is **static HTML** (no PHP needed). This is for if you want to start using PHP + Composer in the future (e.g., for a backend contact form, API, or a new PHP project).

## Step 1: Install PHP (Required)

1. Go to the official downloads page:  
   **https://windows.php.net/download/**

2. Download the latest **"Thread Safe"** version for **x64** (64-bit Windows).  
   Look for something like:  
   `php-8.3.XX-Win32-vs16-x64.zip` (Thread Safe)

3. Create a folder: `C:\php`

4. Extract the entire contents of the zip into `C:\php`

5. In `C:\php`, copy `php.ini-development` and rename the copy to `php.ini`

6. Edit `php.ini` (right-click → Edit with Notepad or VS Code) and **uncomment** these lines (remove the `;` at the start):

   ```
   extension=openssl
   extension=mbstring
   extension=fileinfo
   ;extension=gd   ; uncomment this too if you want image processing later
   ```

   Also set a timezone near the top:
   ```
   date.timezone = America/New_York
   ```

7. Add PHP to your Windows PATH:
   - Press Windows key + S, type "Environment Variables", open "Edit the system environment variables"
   - Click "Environment Variables..."
   - Under "User variables for [your name]", find "Path" and click Edit
   - Click "New" and add: `C:\php`
   - Click OK on all windows

8. **Close and reopen** PowerShell / Command Prompt.

9. Test:
   ```powershell
   php --version
   ```
   You should see something like `PHP 8.3.x ...`

## Step 2: Install Composer

1. Download the Windows installer directly:  
   **https://getcomposer.org/Composer-Setup.exe**

2. Run the .exe file.

3. When it asks for the PHP path, browse to and select:  
   `C:\php\php.exe`

4. Complete the installation (it will add `composer` to your PATH).

5. **Close and reopen** PowerShell.

6. Test:
   ```powershell
   composer --version
   ```

## Step 3: Basic Usage

```powershell
# Go to any folder where you want a PHP project
cd C:\Users\Jeremy Mahoney\Projects\NewPHPProject

# Start a new project
composer init

# Add a package (example)
composer require guzzlehttp/guzzle

# Install everything listed in composer.json
composer install

# Update packages
composer update

# See what you have installed
composer show
```

In your PHP files you will usually start with:
```php
require __DIR__ . '/vendor/autoload.php';
```

## If You Want to Use Composer in This MahoneyDigital Project

Right now it doesn't make sense because the site is pure static HTML + Tailwind CDN + Netlify Forms.

If you ever want to:
- Replace Netlify Forms with a custom PHP contact form
- Add a small PHP backend
- Start a separate PHP project alongside the static site

...just tell me and I'll:
- Set up a `backend/` or `php/` folder
- Add a composer.json
- Give you example code that uses the signature/phone you already have

## Common Issues & Fixes

- "php is not recognized" → You didn't restart PowerShell after adding to PATH, or the path is wrong.
- "composer is not recognized" → Run the Composer-Setup.exe again and make sure it found your php.exe.
- Download problems → Manually download the PHP zip and Composer-Setup.exe as shown above.
- Want a simpler way? Install XAMPP (includes PHP + Composer + Apache), but it's heavier than needed for CLI-only use.

## Next Steps?

Reply with what you actually want to do with Composer and I'll set it up properly in your MahoneyDigital folder or a new project.

For now, follow the two download links above and the PATH steps — it usually takes 5-10 minutes.

Let me know the output of `php --version` and `composer --version` once you finish!