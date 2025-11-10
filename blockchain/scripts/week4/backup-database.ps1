  # FamilyChain Database Backup Script
  # Creates timestamped PostgreSQL backups

  param(
      [string]$BackupDir = ".\backups",
      [string]$DatabaseName = "familychain",
      [string]$PostgresUser = "postgres",
      [int]$RetentionDays = 30
  )

  # Create backup directory if it doesn't exist
  if (-not (Test-Path $BackupDir)) {
      New-Item -ItemType Directory -Path $BackupDir | Out-Null
      Write-Host "✅ Created backup directory: $BackupDir"
  }

  # Generate timestamp
  $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $backupFile = Join-Path $BackupDir "familychain_backup_$timestamp.sql"

  Write-Host "🔄 Starting database backup..."
  Write-Host "   Database: $DatabaseName"
  Write-Host "   File: $backupFile"

  # Run pg_dump
  try {
      $pgDumpPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
      $env:PGPASSWORD = $env:DB_PASSWORD
      & $pgDumpPath -U $PostgresUser -d $DatabaseName -F p -f $backupFile

      if ($LASTEXITCODE -eq 0) {
          $fileSize = (Get-Item $backupFile).Length / 1KB
          Write-Host "✅ Backup completed successfully!"
          Write-Host "   Size: $([math]::Round($fileSize, 2)) KB"
          Write-Host "   Location: $backupFile"
      } else {
          Write-Host "❌ Backup failed with exit code: $LASTEXITCODE"
          exit 1
      }
  } catch {
      Write-Host "❌ Error during backup: $_"
      exit 1
  } finally {
      Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
  }

  # Cleanup old backups (older than retention period)
  Write-Host ""
  Write-Host "🧹 Cleaning up old backups (older than $RetentionDays days)..."
  $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
  $oldBackups = Get-ChildItem -Path $BackupDir -Filter "familychain_backup_*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate }

  if ($oldBackups.Count -gt 0) {
      foreach ($backup in $oldBackups) {
          Remove-Item $backup.FullName -Force
          Write-Host "   Deleted: $($backup.Name)"
      }
      Write-Host "✅ Removed $($oldBackups.Count) old backup(s)"
  } else {
      Write-Host "   No old backups to remove"
  }

  Write-Host ""
  Write-Host "📊 Current backups:"
  Get-ChildItem -Path $BackupDir -Filter "familychain_backup_*.sql" |
      Sort-Object LastWriteTime -Descending |
      Select-Object Name, @{Name="Size (KB)";Expression={[math]::Round($_.Length/1KB, 2)}}, LastWriteTime |
      Format-Table -AutoSize

  Write-Host "✅ Backup process complete!"