import sqlite3
import uuid
from datetime import datetime

def migrate_duplicate_moments():
    conn = sqlite3.connect('music.db')
    cursor = conn.cursor()
    
    # Find all songs with multiple moments
    cursor.execute("""
        SELECT songId, COUNT(*) as count 
        FROM music_moments 
        GROUP BY songId 
        HAVING count > 1
    """)
    duplicate_songs = cursor.fetchall()
    
    for song_id, count in duplicate_songs:
        print(f"Processing song {song_id} with {count} moments...")
        
        # Get all moments for this song, ordered by creation date
        cursor.execute("""
            SELECT id, content, createdAt 
            FROM music_moments 
            WHERE songId = ? 
            ORDER BY createdAt ASC
        """, (song_id,))
        moments = cursor.fetchall()
        
        # Keep the first moment, convert others to comments
        first_moment_id = moments[0][0]
        print(f"  Keeping moment {first_moment_id} as the main post")
        
        for moment in moments[1:]:
            moment_id, content, created_at = moment
            
            # Create a comment from this moment
            comment_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO moment_comments (id, momentId, content, listenDate, location, createdAt)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (comment_id, first_moment_id, content, None, None, created_at))
            
            print(f"  Converted moment {moment_id} to comment {comment_id}")
            
            # Delete the old moment
            cursor.execute("DELETE FROM music_moments WHERE id = ?", (moment_id,))
            print(f"  Deleted moment {moment_id}")
    
    conn.commit()
    conn.close()
    print("Migration completed!")

if __name__ == "__main__":
    migrate_duplicate_moments()
