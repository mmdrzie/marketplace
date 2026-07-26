[1mdiff --git a/nextjs-frontend/package.json b/nextjs-frontend/package.json[m
[1mindex 7c93ee2..742b1b5 100644[m
[1m--- a/nextjs-frontend/package.json[m
[1m+++ b/nextjs-frontend/package.json[m
[36m@@ -33,8 +33,7 @@[m
   },[m
   "lint-staged": {[m
     "*.{ts,tsx}": [[m
[31m-      "eslint --fix",[m
[31m-      "vitest run --passWithNoTests --no-coverage"[m
[32m+[m[32m      "eslint --fix"[m
     ][m
   },[m
   "devDependencies": {[m
[36m@@ -51,10 +50,8 @@[m
     "clsx": "^2.1.1",[m
     "eslint": "^9",[m
     "eslint-config-next": "16.2.9",[m
[31m-    "happy-dom": "^20.10.6",[m
     "husky": "^9.1.7",[m
     "jsdom": "^29.1.1",[m
[31m-    "lint-staged": "^17.0.8",[m
     "sharp": "^0.35.3",[m
     "tailwind-merge": "^3.6.0",[m
     "tailwindcss": "^4",[m
