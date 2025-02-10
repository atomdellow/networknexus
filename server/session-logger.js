const fs = require('fs').promises;
const path = require('path');

class SessionLogger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.sessions = new Map();
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  startSession(sessionId, clientInfo) {
    const session = {
      id: sessionId,
      startTime: Date.now(),
      clientInfo,
      events: [],
      logFile: path.join(this.logDir, `session_${sessionId}_${Date.now()}.log`)
    };
    
    this.sessions.set(sessionId, session);
    this.logEvent(sessionId, 'SESSION_START', clientInfo);
  }

  async logEvent(sessionId, type, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const event = {
      timestamp: Date.now(),
      type,
      data
    };

    session.events.push(event);

    try {
      await fs.appendFile(
        session.logFile,
        JSON.stringify(event) + '\n',
        'utf8'
      );
    } catch (error) {
      console.error('Failed to write to session log:', error);
    }
  }

  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    await this.logEvent(sessionId, 'SESSION_END', {
      duration: Date.now() - session.startTime
    });

    this.sessions.delete(sessionId);
  }

  async getSessionLogs(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    try {
      const logs = await fs.readFile(session.logFile, 'utf8');
      return logs.split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));
    } catch (error) {
      console.error('Failed to read session logs:', error);
      return null;
    }
  }

  async cleanOldLogs(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.logDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtime.getTime();
        
        if (age > daysToKeep * 24 * 60 * 60 * 1000) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }
}

module.exports = new SessionLogger();
