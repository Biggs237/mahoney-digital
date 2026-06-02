# How to Install and Use Composer on Windows

**Note:** Composer is a dependency manager for PHP projects. Your current Mahoney Digital project is a **static HTML site** (no PHP, uses Tailwind via CDN and Netlify Forms). You don't need Composer for it right now.

If you want to add PHP features later (e.g., custom backend, forms processing beyond Netlify), we can set that up.

## Prerequisites
- Windows 10/11
- Internet connection
- Administrator rights recommended for PATH changes

## Step 1: Install PHP (Required for Composer)

1. Go to the official PHP for Windows downloads:  
   https://windows.php.net/download/

2. Download the latest **Thread Safe** version for your architecture (usually **x64**).  
   Example: `php-8.3.11-Win32-vs16-x64.zip` (Thread Safe)

3. Extract the zip to a folder, e.g., `C:\php`

4. Copy `php.ini-development` to `php.ini` in that folder:
   ```
   copy C:\php\php.ini-development C:\php\php.ini
   ```

5. Edit `C:\php\php.ini` (use Notepad or VS Code):
   - Uncomment (remove `;`) these lines:
     ```
     extension=openssl
     extension=mbstring
     extension=fileinfo
     extension=gd   ; optional, for image processing
     ```
   - Set the timezone if needed, e.g.:
     ```
     date.timezone = America/New_York
     ```

6. Add PHP to your PATH:
   - Search for "Environment Variables" in Start menu.
   - Edit "Path" under User variables.
   - Add `C:\php`
   - Open a **new** PowerShell window and test:
     ```
     php --version
     ```

## Step 2: Install Composer

### Option A: Easy Installer (Recommended)
1. Download the official Windows installer:  
   https://getcomposer.org/Composer-Setup.exe

2. Run `Composer-Setup.exe`
3. It will ask for the PHP path — point it to `C:\php\php.exe`
4. Complete the install. It adds `composer` to PATH.

5. Open **new** PowerShell and test:
   ```
   composer --version
   ```

### Option B: Manual (using the script I created)
I created a helper script for you:
`C:\Users\Jeremy Mahoney\install-composer.ps1`

But since downloads may be restricted in some environments, run it manually or download the files yourself.

## Step 3: Basic Usage of Composer

Open PowerShell in your project folder (e.g., `cd C:\Users\Jeremy Mahoney\Projects\MahoneyDigital`)

### Initialize a new project
```
composer init
```
Follow the prompts (name, description, etc.). Creates `composer.json`.

### Require a package
```
composer require vendor/package
```
Example (for a simple HTTP client):
```
composer require guzzlehttp/guzzle
```

### Install dependencies
```
composer install
```
This reads `composer.json` and installs to `vendor/` folder. Creates `composer.lock`.

### Update packages
```
composer update
```

### Autoload classes (very useful)
In your PHP files:
```php
require 'vendor/autoload.php';
```

### Other common commands
- `composer dump-autoload` — regenerate autoloader
- `composer show` — list installed packages
- `composer remove vendor/package` — remove a package
- `composer validate` — check composer.json

## Important Notes for Your Project

- **Current project is static** — no need for Composer/PHP.
- If you want to add a PHP backend (e.g., custom contact form instead of Netlify Forms, or API), tell me and we'll:
  1. Set up a simple PHP structure.
  2. Use Composer for libraries.
  3. Deploy to a PHP host (Netlify doesn't support PHP).

## Troubleshooting

- "php is not recognized" → PHP not in PATH. Restart terminal or add manually.
- "composer is not recognized" → Run the installer again or add `C:\php` (where composer.phar is) to PATH.
- Permission errors → Run PowerShell as Administrator.
- SSL errors → Make sure `extension=openssl` is enabled in php.ini.

## Next Steps?

If you want to:
- Use Composer for a **new PHP project**
- Add PHP features to **Mahoney Digital** (e.g., server-side contact form)
- Set up a full stack with Laravel/Symfony (overkill for this site)

Just tell me and I'll create the files/scripts for you.

Run this to test after install:
```powershell
php -v
composer -V
```

Let me know the output or any errors!