import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Button, Text, Card, IconButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAppContext } from '../context/AppContext';

interface PDFFile {
  uri: string;
  name: string;
  timestamp: number;
}

export default function LibraryScreen() {
  const router = useRouter();
  const { theme, bookmarks } = useAppContext();
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      const storedPDFs = await AsyncStorage.getItem('pdfFiles');
      if (storedPDFs) {
        setPdfFiles(JSON.parse(storedPDFs));
      }
    } catch (error) {
      console.error('Error loading PDFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (result.type === 'success') {
      try {
        const newFile: PDFFile = {
          uri: result.uri,
          name: result.name,
          timestamp: Date.now(),
        };

        const updatedFiles = [...pdfFiles, newFile];
        setPdfFiles(updatedFiles);
        await AsyncStorage.setItem('pdfFiles', JSON.stringify(updatedFiles));

        // Navigate to reader with the new PDF
        router.push({
          pathname: 'reader',
          params: { uri: result.uri },
        });
      } catch (error) {
        console.error('Error saving PDF:', error);
      }
    }
  };

  const handleDeletePDF = async (uri: string) => {
    try {
      const updatedFiles = pdfFiles.filter(file => file.uri !== uri);
      setPdfFiles(updatedFiles);
      await AsyncStorage.setItem('pdfFiles', JSON.stringify(updatedFiles));
      // Remove any bookmarks for this PDF
      const updatedBookmarks = bookmarks.filter(b => b.pdfUri !== uri);
      await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  };

  const renderPDFItem = ({ item }: { item: PDFFile }) => {
    const isBookmarked = bookmarks.some(b => b.pdfUri === item.uri);
    const bookmarkedPage = bookmarks.find(b => b.pdfUri === item.uri)?.page || 1;

    return (
      <Card
        style={[
          styles.pdfCard,
          { backgroundColor: theme === 'dark' ? '#2d2d2d' : '#fff' },
        ]}
      >
        <Card.Content>
          <View style={styles.pdfInfo}>
            <Text style={[
              styles.pdfTitle,
              { color: theme === 'dark' ? '#fff' : '#000' },
            ]}>
              {item.name}
            </Text>
            {isBookmarked && (
              <Text style={[
                styles.bookmarkInfo,
                { color: theme === 'dark' ? '#00ff00' : '#00ff00' },
              ]}>
                Bookmarked at page {bookmarkedPage}
              </Text>
            )}
          </View>
          <View style={styles.pdfActions}>
            <IconButton
              icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isBookmarked ? '#00ff00' : '#fff'}
              onPress={() => {
                router.push({
                  pathname: 'reader',
                  params: { uri: item.uri },
                });
              }}
            />
            <IconButton
              icon="delete"
              size={24}
              color="#ff4444"
              onPress={() => handleDeletePDF(item.uri)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff' },
    ]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: theme === 'dark' ? '#fff' : '#000' },
          ]}
        >
          PDF Library
        </Text>
        <Button
          mode="contained"
          onPress={handlePickPDF}
          style={[
            styles.button,
            { backgroundColor: theme === 'dark' ? '#00ff00' : '#007aff' },
          ]}
        >
          Add PDF
        </Button>
      </View>
      {isLoading ? (
        <Text
          style={[
            styles.loadingText,
            { color: theme === 'dark' ? '#fff' : '#000' },
          ]}
        >
          Loading...
        </Text>
      ) : (
        <FlatList
          data={pdfFiles}
          renderItem={renderPDFItem}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    width: '30%',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  pdfCard: {
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  bookmarkInfo: {
    fontSize: 12,
  },
  pdfActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
