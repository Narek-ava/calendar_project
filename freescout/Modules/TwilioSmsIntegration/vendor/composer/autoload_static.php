<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit4ad95f8cdefc01d744eb0e207ae545e0
{
    public static $prefixLengthsPsr4 = array (
        'T' => 
        array (
            'Twilio\\' => 7,
        ),
        'M' => 
        array (
            'Modules\\TwilioSmsIntegration\\' => 29,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Twilio\\' => 
        array (
            0 => __DIR__ . '/..' . '/twilio/sdk/src/Twilio',
        ),
        'Modules\\TwilioSmsIntegration\\' => 
        array (
            0 => __DIR__ . '/../..' . '/',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit4ad95f8cdefc01d744eb0e207ae545e0::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit4ad95f8cdefc01d744eb0e207ae545e0::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit4ad95f8cdefc01d744eb0e207ae545e0::$classMap;

        }, null, ClassLoader::class);
    }
}
