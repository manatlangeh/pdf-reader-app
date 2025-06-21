import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import PDFView from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, IconButton, Dialog, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAppContext } from '../context/AppContext';

type Props = {
  params: {
    uri?: string;
  };
};

export default function ReaderScreen({ params }: Props) {
  const router = useRouter();
  const { theme, addBookmark, removeBookmark, getBookmarkPage } = useAppContext();
  const [pdfUri, setPdfUri] = useState(params.uri || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [jumpToPage, setJumpToPage] = useState('');
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        if (!pdfUri && params.uri) {
          setPdfUri(params.uri);
          setIsLoading(false);
          return;
        }

        if (!pdfUri) {
          const uri = await AsyncStorage.getItem('currentPdf');
          if (uri) {
            setPdfUri(uri);
            setIsLoading(false);
          }
        }

        const bookmarkedPage = getBookmarkPage(pdfUri);
        if (bookmarkedPage) {
          setCurrentPage(bookmarkedPage);
        }
      } catch (error) {
        setError('Error loading PDF');
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [params.uri, getBookmarkPage]);

  useEffect(() => {
    const checkBookmark = () => {
      if (!pdfUri) return;
      setIsBookmarked(!!getBookmarkPage(pdfUri));
    };
    checkBookmark();
  }, [pdfUri, getBookmarkPage]);

  const handleTryAgain = async () => {
    setError('');
    setPdfUri('');
    await AsyncStorage.removeItem('currentPdf');
    router.replace('/library');
  };

  const handlePageChange = (page: number, numberOfPages: number) => {
    setCurrentPage(page);
    setTotalPages(numberOfPages);
  };

  const handleBookmark = () => {
    if (!pdfUri) return;
    if (isBookmarked) {
      removeBookmark(pdfUri);
    } else {
      addBookmark(pdfUri, currentPage);
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      setCurrentPage(page);
      setShowJumpDialog(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button
          mode="contained"
          onPress={handleTryAgain}
          style={styles.button}
        >
          Try Again
        </Button>
      </View>
    );
  }

  if (!pdfUri) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            {currentPage} / {totalPages}
          </Text>
        </View>
        <View style={styles.controls}>
          <IconButton
            icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            onPress={handleBookmark}
            color={isBookmarked ? '#00ff00' : '#fff'}
          />
          <IconButton
            icon="arrow-left"
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          />
          <IconButton
            icon="arrow-right"
            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          />
          <IconButton
            icon="jump-to-page"
            onPress={() => setShowJumpDialog(true)}
          />
        </View>
      </View>
      <PDFView
        source={{ uri: pdfUri }}
        style={styles.pdf}
        enablePaging={true}
        enableAnnotationRendering={true}
        onLoadComplete={(numberOfPages) => {
          setTotalPages(numberOfPages);
        }}
        onPageChanged={handlePageChange}
        onError={(error) => {
          setError('Error loading PDF: ' + error.message);
        }}
        onPageError={(error) => {
          setError('Error on page: ' + error.message);
        }}
      />
      <Portal>
        <Dialog visible={showJumpDialog} onDismiss={() => setShowJumpDialog(false)}>
          <Dialog.Title>Jump to Page</Dialog.Title>
          <Dialog.Content>
            <TextInput
              value={jumpToPage}
              onChangeText={setJumpToPage}
              keyboardType="number-pad"
              placeholder={`Enter page number (1-${totalPages})`}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowJumpDialog(false)}>Cancel</Button>
            <Button onPress={handleJumpToPage}>Jump</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  pdf: {
    flex: 1,
    backgroundColor: '#fff',
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f0f0f0',
  },
  pageInfo: {
    paddingHorizontal: 10,
  },
  pageText: {
    color: theme === 'dark' ? '#fff' : '#000',
  },
  controls: {
    flexDirection: 'row',
  },
});
