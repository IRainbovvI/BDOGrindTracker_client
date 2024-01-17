import { Stack, useRouter } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { COLORS, images, icons, SIZES, FONT } from '../constants';
import { useSession } from '../components/AuthProvider';

const signInSchema = yup.object().shape({
    email: yup
        .string()
        .email('Please enter valid email')
        .required('Email address is required'),
    password: yup.string().required('Password is required')
});

const SignIn = () => {
    const { signIn } = useSession();
    const router = useRouter();

    return (
        <>
            <>
                <Stack.Screen options={{ animation: 'slide_from_bottom' }} />
                <View style={styles.container}>
                    <Formik
                        validationSchema={signInSchema}
                        initialValues={{ email: '', password: '' }}
                        onSubmit={(values) => signIn(values)}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            isValid
                        }) => (
                            <View style={styles.card}>
                                <TextInput
                                    name='email'
                                    style={styles.input}
                                    placeholder='Email'
                                    placeholderTextColor={COLORS.tertiary}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    value={values.email}
                                    keyboardType='email-address'
                                />
                                <TextInput
                                    name='password'
                                    style={styles.input}
                                    placeholder='Password'
                                    placeholderTextColor={COLORS.tertiary}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    secureTextEntry={true}
                                />

                                {!isValid && (
                                    <View style={styles.errorCard}>
                                        {errors.email && (
                                            <Text style={styles.errorText}>
                                                {errors.email}
                                            </Text>
                                        )}
                                        {errors.password && (
                                            <Text style={styles.errorText}>
                                                {errors.password}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.button}
                                    disabled={!isValid}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.text}>Sign In</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        router.back();
                                    }}
                                >
                                    <Text style={styles.text}>Go Back</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Formik>
                </View>
            </>
        </>
    );
};

export default SignIn;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        width: Dimensions.get('window').width - 40,
        backgroundColor: COLORS.secondary,
        borderRadius: 5,
        padding: 30
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        borderColor: COLORS.tertiary,
        color: COLORS.white
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        backgroundColor: COLORS.tertiary,
        marginTop: 20
    },
    text: {},
    errorCard: {
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 5,
        padding: 5
    },
    errorText: {
        color: 'red',
        fontSize: 10
    }
});
