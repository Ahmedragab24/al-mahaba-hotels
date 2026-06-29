const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, "src"));

for (const file of files) {
  if (file.includes("use-auth.tsx")) continue;
  
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  if (content.includes("useAuth")) {
    // Replace import
    content = content.replace(/import\s+\{\s*useAuth\s*\}\s+from\s+["']@\/hooks\/use-auth["'];?/g, 'import { useSelector } from "react-redux";\nimport { selectAuth } from "@/store/features/authSlice";\nimport { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";');
    
    // Replace hook call
    content = content.replace(/const\s+auth\s*=\s*useAuth\(\);?/g, 'const auth = useSelector(selectAuth);');
    
    // Replace auth.isAdmin with isAdmin(auth)
    content = content.replace(/auth\.isAdmin/g, 'isAdmin(auth)');
    
    // Replace auth.hasRole(X) with hasRole(auth, X)
    content = content.replace(/auth\.hasRole\(([^)]+)\)/g, 'hasRole(auth, $1)');
    
    // Replace auth.hasAnyRole(X) with hasAnyRole(auth, X)
    content = content.replace(/auth\.hasAnyRole\(([^)]+)\)/g, 'hasAnyRole(auth, $1)');
    
    // Replace auth.canAccessModule(X) with canAccessModule(auth, X)
    content = content.replace(/auth\.canAccessModule\(([^)]+)\)/g, 'canAccessModule(auth, $1)');
    
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Refactored useAuth in " + file);
  }
}
