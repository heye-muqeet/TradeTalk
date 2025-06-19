import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import { API, COLORS, THEME } from '../../constants/constants';
import { responsiveVertical } from '../../components/responsive';
import { useAppSelector } from '../../redux/hooks';
import { Linking } from 'react-native';

const InvoicesList = ({ navigation }: any) => {
    const [invoices, setInvoices] = useState<{ id: number; fileName: string; createdAt: string; status: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();
    const user = useAppSelector((state) => state.appState.user);
    const userId = user?.id || null;

    useEffect(() => {
        if (isFocused) fetchInvoices();
    }, [isFocused]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API.BASE_URL2}/invoices/pdf-urls?userId=${userId}`);
            const data: { id: number; pdfUrl: string; createdAt: string; status: string }[] = await response.json();

            const fileData = data
                .filter(item => item.pdfUrl && !item.pdfUrl.startsWith('/invoices/download/'))
                .map(item => ({
                    id: item.id,
                    fileName: item.pdfUrl.split('/').pop(),
                    createdAt: new Date(item.createdAt).toLocaleString(),
                    status: item.status,
                }));

            setInvoices(fileData);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (fileName: string) => {
        const fileUrl = `${API.BASE_IP}/Uploads/invoices/${fileName}`;
        Linking.openURL(fileUrl).catch(err => console.error('Failed to open URL:', err));
    };

    const handleStatusChange = async (invoiceId: number, newStatus: string) => {
        try {
            const response = await fetch(`${API.BASE_URL2}/invoices/update-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    invoiceId,
                    userId,
                    status: newStatus,
                }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            setInvoices(prev =>
                prev.map(invoice =>
                    invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
                )
            );
        } catch (error) {
            console.error('Failed to update status:', error);
            Alert.alert('Failed to update status. Please try again.');
        }
    };

    const renderItem = ({ item }: { item: { id: number; fileName: string; createdAt: string; status: string } }) => {
        return (
            <View style={styles.itemContainer}>
                <View style={styles.detailsContainer}>
                    <Text style={styles.fileNameText} numberOfLines={1}>{item.fileName}</Text>
                    <Text style={styles.dateText}>{item.createdAt}</Text>
                </View>
                <View style={styles.rightControls}>
                    <TouchableOpacity onPress={() => handleDownload(item.fileName)} style={styles.downloadIconWrapper}>
                        <Icon name="download-outline" size={22} color={THEME.PRIMARY} />
                    </TouchableOpacity>
                    <View style={[
                        styles.statusBadge,
                        item.status === 'Pending' ? styles.pendingStatus : styles.acceptedStatus,
                    ]}>
                        <Picker
                            selectedValue={item.status}
                            onValueChange={(value) => handleStatusChange(item.id, value)}
                            style={styles.statusPicker}
                            dropdownIconColor={COLORS.BLACK}
                        >
                            <Picker.Item label="Pending" value="Pending" />
                            <Picker.Item label="Accepted" value="Accepted" />
                        </Picker>
                    </View>
                </View>
            </View>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={COLORS.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Invoice List</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={fetchInvoices}>
                    <Icon name="refresh" size={24} color={COLORS.WHITE} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.BLACK} />
                </View>
            ) : invoices.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No invoices found.</Text>
                </View>
            ) : (
                <FlatList
                    data={invoices}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.WHITE,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? responsiveVertical(0) : responsiveVertical(30),
        backgroundColor: THEME.PRIMARY,
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: Platform.OS === 'ios' ? responsiveVertical(18) : responsiveVertical(32),
    },
    headerTitle: {
        color: COLORS.WHITE,
        fontSize: 20,
        fontWeight: 'bold',
    },
    refreshButton: {
        position: 'absolute',
        right: 16,
        top: Platform.OS === 'ios' ? responsiveVertical(18) : responsiveVertical(32),
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 12,
        marginBottom: 12,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    detailsContainer: {
        flex: 1,
    },
    rightControls: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    fileNameText: {
        color: COLORS.BLACK,
        fontSize: 15,
        fontWeight: '600',
    },
    dateText: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
    },
    downloadIconWrapper: {
        marginBottom: 10,
        padding: 6,
        borderRadius: 20,
    },
    statusBadge: {
        borderRadius: 8,
        overflow: 'hidden',
        width: 140,
        height: 35,
        justifyContent: 'center',
    },
    pendingStatus: {
        backgroundColor: '#fff3cd',
    },
    acceptedStatus: {
        backgroundColor: '#d4edda',
    },
    statusPicker: {
        height: 35,
        width: '100%',
        paddingHorizontal: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
});


export default InvoicesList;